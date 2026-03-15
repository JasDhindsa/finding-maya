# Architecture Diagram

This diagram reflects the current repo architecture for the "Finding Maya" interactive investigation app.

```mermaid
flowchart LR
  user["Player / Judge"]

  subgraph client["Frontend Web App (React + Vite)"]
    ui["Cartoon phone UI<br/>Messages, Phone, Photos, Maps, Drive, etc."]
    game["GameContext<br/>device state, app state, notifications"]
    story["Zustand Story Store<br/>AI objectives, progress, knowledge"]
    sync["StoryProvider + GameSyncManager"]
    engine["StoryEngine<br/>orchestrates narrative triggers"]
    
    subgraph agents["AI Agent Logic"]
      msg["NPC Chat Agent<br/>(Tool-using reasoning loop)"]
      phone["Live Voice Agent<br/>(Real-time audio interface)"]
      eval["Narrative Evaluator<br/>(LLM-as-Judge)"]
      memory["Agent Tool<br/>(recall_memory function)"]
    end
  end

  subgraph assets["Story Content"]
    yaml["YAML constraints & backstory"]
    media["Images + audio evidence"]
  end

  subgraph google_ai["Google AI"]
    flash["Gemini 2.5 Flash<br/>GenAI SDK"]
    live["Gemini Live API<br/>WebSocket Streams"]
  end

  subgraph firebase["Google Cloud / Firebase"]
    auth["Firebase Auth<br/>anonymous sign-in"]
    firestore["Cloud Firestore<br/>persisted player state"]
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
  ui --> phone
  
  msg --> memory
  memory --> story
  
  engine --> eval
  story --> eval
  eval --> story

  msg <--> flash
  eval --> flash
  
  user -- "voice input" --> phone
  phone <--> live
  live -- "streamed audio reply" --> user

  sync --> auth
  sync --> firestore
  firestore --> sync
```

## What Judges Should Notice

- **Agentic NPC Logic:** Characters use a plan-act-observe loop powered by Gemini 2.5 Flash, allowing them to autonomously use tools like `recall_memory` to dynamically reveal clues.
- **LLM-as-Judge Evaluator:** A background narrative evaluator silently monitors conversations to determine when players have met custom objectives, unlocking new content dynamically.
- **Multimodal Real-Time Agents:** Uses the Gemini Live API to power real-time, interruptible conversational voice agents simulating live investigations.
- **State-Driven Story Engine:** The frontend (React/Vite) dynamically renders a phone OS investigation interface while Firebase Auth and Cloud Firestore persist progress.
- **Declarative Narrative Constraints:** Story content, personas, and behavioral constraints are loaded from local YAML files and injected directly into the agents' context windows.

## Short Submission Caption

The frontend is a React/Vite mobile-style investigation interface that acts as the client for multiple specialized AI agents. NPC text conversations are driven by a tool-using Agent Loop powered by Gemini 2.5 Flash, while voice calls use the Gemini Live API for real-time streaming interactions. A background LLM-as-Judge continuously evaluates player progress against YAML-defined objectives to progress the story. Firebase Auth and Cloud Firestore on Google Cloud persist each player's state across sessions.
