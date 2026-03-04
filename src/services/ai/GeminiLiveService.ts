const API_KEY = import.meta.env.VITE_GOOGLE_GEMINI_API_KEY || "";
const MODEL = "models/gemini-2.5-flash-native-audio-preview-12-2025";
const WS_URL = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent?key=${API_KEY}`;

export class GeminiLiveService {
    private socket: WebSocket | null = null;
    private mediaStream: MediaStream | null = null;
    private processor: AudioWorkletNode | ScriptProcessorNode | null = null;
    private player: AudioQueuePlayer | null = null;
    private isConnected = false;

    // Callbacks
    onConnectionStatus?: (status: boolean) => void;
    onTranscriptReceived?: (text: string) => void;
    onAudioReceived?: (pcmData: Uint8Array) => void;
    onHangUp?: () => void;

    private getAudioContext(): AudioContext | null {
        return this.player?.getAudioContext() || null;
    }

    async connect(personaPrompt: string, voiceName: string = "Puck") {
        if (this.isConnected) this.disconnect();

        return new Promise<void>(async (resolve, reject) => {
            try {
                console.log('GeminiLive: Initializing audio player...');
                if (!this.player) {
                    this.player = new AudioQueuePlayer(24000);
                }

                console.log('GeminiLive: Requesting microphone...');
                this.mediaStream = await navigator.mediaDevices.getUserMedia({
                    audio: {
                        echoCancellation: true,
                        noiseSuppression: true,
                        autoGainControl: true
                    }
                });

                const ctx = this.getAudioContext();
                if (ctx && ctx.state === 'suspended') {
                    await ctx.resume();
                }

                console.log('GeminiLive: Connecting to WebSocket...', WS_URL.split('?')[0]);
                this.socket = new WebSocket(WS_URL);

                let isSetupDone = false;

                this.socket.onopen = () => {
                    console.log('GeminiLive: WebSocket connected. Sending setup...');
                    const setupMsg = {
                        setup: {
                            model: MODEL,
                            generation_config: {
                                response_modalities: ["audio"],
                                speech_config: {
                                    voice_config: {
                                        prebuilt_voice_config: {
                                            voice_name: voiceName
                                        }
                                    }
                                }
                            },
                            system_instruction: {
                                parts: [{ text: personaPrompt }]
                            }
                        }
                    };
                    this.socket?.send(JSON.stringify(setupMsg));
                };

                this.socket.onmessage = async (event) => {
                    let message;
                    try {
                        let data = event.data;
                        if (data instanceof Blob) {
                            data = await data.text();
                        }
                        message = JSON.parse(data);
                    } catch (e) {
                        console.error('GeminiLive: Failed to parse message', event.data, e);
                        return;
                    }

                    console.log('GeminiLive: Message received', message);

                    if (message.setupComplete || message.setup_complete) {
                        console.log('GeminiLive: Setup complete. Starting mic...');
                        isSetupDone = true;
                        this.isConnected = true;
                        this.onConnectionStatus?.(true);
                        this.startMic();
                        resolve();
                    }

                    this.handleMessage(message);
                };

                this.socket.onerror = (e) => {
                    console.error('GeminiLive: WebSocket error', e);
                    if (!isSetupDone) reject(e);
                    this.onConnectionStatus?.(false);
                };

                this.socket.onclose = (e) => {
                    console.log(`GeminiLive: WebSocket closed. Code: ${e.code}, Reason: ${e.reason}`);
                    if (!isSetupDone) reject(new Error(`WebSocket closed before setup: ${e.reason || e.code}`));
                    this.disconnect();
                };

            } catch (error) {
                console.error('GeminiLive: Connection failed', error);
                this.disconnect();
                reject(error);
            }
        });
    }

    private handleMessage(message: any) {
        const serverContent = message.serverContent || message.server_content;
        if (serverContent) {
            if (serverContent.interrupted) {
                console.log('GeminiLive: AI interrupted. Clearing player...');
                this.player?.clear();
            }

            const modelTurn = serverContent.modelTurn || serverContent.model_turn;
            if (modelTurn && modelTurn.parts) {
                for (const part of modelTurn.parts) {
                    if (part.inlineData && part.inlineData.data) {
                        const audioData = this.base64ToUint8(part.inlineData.data);
                        this.player?.enqueue(audioData);
                        this.onAudioReceived?.(audioData);
                    } else if (part.text) {
                        this.onTranscriptReceived?.(part.text);
                        if (part.text.toUpperCase().includes('[HANG_UP]')) {
                            console.log('GeminiLive: AI initiated hang up.');
                            this.onHangUp?.();
                            this.disconnect();
                        }
                    }
                }
            }
        }

        if (message.error) {
            console.error('GeminiLive: Server error', message.error);
        }
    }

    private startMic() {
        const ctx = this.getAudioContext();
        if (!ctx || !this.mediaStream) return;

        console.log('GeminiLive: Starting mic processor...');
        const source = ctx.createMediaStreamSource(this.mediaStream);
        this.processor = ctx.createScriptProcessor(4096, 1, 1);

        // Connect to a zero-gain node to satisfy browser requirements without feedback
        const gainNode = ctx.createGain();
        gainNode.gain.value = 0;

        source.connect(this.processor);
        this.processor.connect(gainNode);
        gainNode.connect(ctx.destination);

        let chunkCount = 0;
        (this.processor as ScriptProcessorNode).onaudioprocess = (e) => {
            if (!this.isConnected) return;
            const input = e.inputBuffer.getChannelData(0);

            // Basic volume check
            let maxVal = 0;
            for (let i = 0; i < input.length; i++) maxVal = Math.max(maxVal, Math.abs(input[i]));

            const pcm16 = this.floatToS16(input);
            this.sendAudioChunk(pcm16);

            if (chunkCount % 50 === 0) {
                console.log(`GeminiLive: Sent ${chunkCount} audio chunks. Max Vol: ${maxVal.toFixed(4)}`);
            }
            chunkCount++;
        };
    }

    private sendAudioChunk(pcmData: Int16Array) {
        if (!this.isConnected || !this.socket || this.socket.readyState !== WebSocket.OPEN) return;

        const base64Data = this.uint8ToBase64(new Uint8Array(pcmData.buffer));
        const message = {
            realtime_input: {
                media_chunks: [
                    {
                        mime_type: "audio/pcm;rate=16000",
                        data: base64Data
                    }
                ]
            }
        };
        this.socket.send(JSON.stringify(message));
    }

    disconnect() {
        console.log('GeminiLive: Disconnecting...');
        this.isConnected = false;
        this.onConnectionStatus?.(false);

        if (this.socket) {
            this.socket.close();
            this.socket = null;
        }

        if (this.processor) {
            this.processor.disconnect();
            this.processor = null;
        }

        if (this.mediaStream) {
            this.mediaStream.getTracks().forEach(t => t.stop());
            this.mediaStream = null;
        }

        if (this.player) {
            this.player.stop();
            this.player = null;
        }
    }

    // --- Utilities ---

    private floatToS16(float32: Float32Array): Int16Array {
        const int16 = new Int16Array(float32.length);
        for (let i = 0; i < float32.length; i++) {
            int16[i] = Math.max(-1, Math.min(1, float32[i])) * 0x7FFF;
        }
        return int16;
    }

    private base64ToUint8(base64: string): Uint8Array {
        const binString = atob(base64);
        const length = binString.length;
        const uint8 = new Uint8Array(length);
        for (let i = 0; i < length; i++) {
            uint8[i] = binString.charCodeAt(i);
        }
        return uint8;
    }

    private uint8ToBase64(uint8: Uint8Array): string {
        let binString = "";
        const len = uint8.length;
        for (let i = 0; i < len; i++) {
            binString += String.fromCharCode(uint8[i]);
        }
        return btoa(binString);
    }
}

class AudioQueuePlayer {
    private audioContext: AudioContext;
    private nextStartTime: number = 0;
    private sampleRate: number;

    constructor(sampleRate: number) {
        this.sampleRate = sampleRate;
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 }); // Standardize to 16kHz for both
    }

    getAudioContext() {
        return this.audioContext;
    }

    enqueue(pcmData: Uint8Array) {
        try {
            // Gemini output is S16 LE. Convert to Float32
            const dataView = new DataView(pcmData.buffer);
            const float32 = new Float32Array(pcmData.length / 2);
            for (let i = 0; i < float32.length; i++) {
                float32[i] = dataView.getInt16(i * 2, true) / 32768;
            }

            if (this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }

            const buffer = this.audioContext.createBuffer(1, float32.length, this.sampleRate);
            buffer.getChannelData(0).set(float32);

            const source = this.audioContext.createBufferSource();
            source.buffer = buffer;
            source.connect(this.audioContext.destination);

            const currentTime = this.audioContext.currentTime;
            this.nextStartTime = Math.max(currentTime, this.nextStartTime);

            source.start(this.nextStartTime);
            this.nextStartTime += buffer.duration;
        } catch (e) {
            console.error('GeminiLive: Error playing audio', e);
        }
    }

    clear() {
        console.log('GeminiLive: Clearing audio queue');
        this.nextStartTime = 0;
        // In a more robust implementation, we would track sources and stop them.
        // For now, resetting the time is the simplest way to "interrupt" next segments.
    }

    stop() {
        if (this.audioContext.state !== 'closed') {
            this.audioContext.close();
        }
    }
}

export const geminiLiveService = new GeminiLiveService();
