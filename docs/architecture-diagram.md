# Architecture Diagram

This diagram reflects the current repo architecture for the "Finding Maya" interactive investigation app.

```mermaid
flowchart LR
  user["Player / Judge"]

  subgraph client["Frontend Web App (React + Vite)"]
    ui["Cartoon phone UI<br/>Messages, Phone, Photos, Maps, Drive, etc."]
    game["GameContext<br/>device state, app state, notifications"]
    story["Zustand Story Store<br/>flags, objectives, personas, progress"]
    sync["StoryProvider + GameSyncManager"]
    engine["StoryEngine<br/>loads YAML story definition"]
    msg["MessagesApp<br/>text-based AI investigation"]
    phone["PhoneApp<br/>live voice calls"]
  end

  subgraph assets["Story Content"]
    yaml["YAML story files"]
    media["Images + audio evidence"]
  end

  subgraph google_ai["Google AI"]
    flash["Gemini 2.5 Flash<br/>Google GenAI SDK"]
    live["Gemini Live API<br/>bidirectional WebSocket audio stream"]
  end

  subgraph firebase["Google Cloud / Firebase"]
    auth["Firebase Auth<br/>anonymous sign-in"]
    firestore["Cloud Firestore<br/>saved game state + story state"]
  end

  user --> ui
  ui <--> game
  ui <--> story
  sync --> story
  sync --> game

  story <--> engine
  engine --> yaml
  engine --> media

  ui --> msg
  msg --> story
  msg --> flash
  flash --> msg

  user -- "voice input" --> phone
  ui --> phone
  phone --> story
  phone --> live
  live -- "streamed audio reply" --> phone

  sync --> auth
  sync --> firestore
  firestore --> sync
```

## What Judges Should Notice

- The app runs as a React/Vite web client styled as a phone operating system for interactive investigation gameplay.
- Gemini 2.5 Flash powers dynamic text conversations and objective evaluation inside the story loop.
- Gemini Live API powers real-time, interruptible voice calls using microphone input and streamed audio output.
- Firebase Auth and Cloud Firestore provide Google Cloud-backed identity and persistence for each player's progress.
- Local YAML story files and bundled media assets define the mystery content, clues, and event triggers.

## Short Submission Caption

The frontend is a React/Vite mobile-style investigation interface that loads structured story content from YAML files and media assets. Gemini 2.5 Flash drives text conversations and story-objective checks, while Gemini Live API powers real-time voice calls with streamed audio. Firebase Auth and Cloud Firestore on Google Cloud persist each player's game and story state across sessions.
