import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useStoryStore } from '../services/story-engine/useStoryStore';
import { useGame } from '../store/GameContext';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../lib/Firebase';
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import debounce from 'lodash/debounce';

export function GameSyncManager({ children }: { children: React.ReactNode }) {
    const { state: storyState, currentStoryId } = useStoryStore();
    const { state: gameState, dispatch } = useGame();
    const [userId, setUserId] = useState<string | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    // Initial auth
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setUserId(user.uid);
            } else {
                try {
                    const cred = await signInAnonymously(auth);
                    setUserId(cred.user.uid);
                } catch (e) {
                    console.error("Auth error", e);
                }
            }
        });
        return () => unsubscribe();
    }, []);

    // Load initial data
    useEffect(() => {
        if (!userId) return;

        const loadData = async () => {
            try {
                const docRef = doc(db, 'users', userId);
                const snap = await getDoc(docRef);
                if (snap.exists()) {
                    const data = snap.data();
                    
                    // Restore Story State
                    if (data.storyState) {
                        useStoryStore.setState({ state: data.storyState, currentStoryId: data.currentStoryId });
                    }

                    // Restore Game State
                    if (data.gameState) {
                        // Normally we'd use a REPLACE_STATE action, but we can do it by modifying the reducer.
                        // For a robust implementation, the GameContext should have a LOAD_STATE action.
                        dispatch({ type: 'LOAD_STATE' as any, payload: data.gameState });
                    }
                }
            } catch (e) {
                console.error("Load error", e);
            } finally {
                setIsLoaded(true);
            }
        };
        
        loadData();
    }, [userId, dispatch]);

    // Save data on change
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const debouncedSave = useCallback(
        debounce(async (sState, gState, cId, uid) => {
            if (!uid) return;
            try {
                // Firebase rejects undefined values, so we sanitize the objects
                const sanitize = (obj: any): any => {
                    if (obj === undefined) return null;
                    if (obj === null || typeof obj !== 'object') return obj;
                    if (Array.isArray(obj)) return obj.map(sanitize);
                    const res: any = {};
                    for (const key in obj) {
                        if (obj[key] !== undefined) {
                            res[key] = sanitize(obj[key]);
                        } else {
                            res[key] = null;
                        }
                    }
                    return res;
                };

                await setDoc(doc(db, 'users', uid), {
                    storyState: sanitize(sState),
                    gameState: sanitize(gState),
                    currentStoryId: cId || null,
                    lastUpdated: Date.now()
                }, { merge: true });
            } catch (e) {
                console.error("Save error", e);
            }
        }, 1000),
        []
    );

    useEffect(() => {
        if (!userId || !isLoaded) return;
        debouncedSave(storyState, gameState, currentStoryId, userId);
    }, [storyState, gameState, currentStoryId, userId, isLoaded, debouncedSave]);

    if (!isLoaded) {
        return <div style={{width:'100vw',height:'100vh',display:'flex',justifyContent:'center',alignItems:'center'}}>Loading profile...</div>;
    }

    return <>{children}</>;
}
