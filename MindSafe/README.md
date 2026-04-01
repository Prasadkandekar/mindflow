# MindSafe

An AI-powered mental health platform combining a real-time voice companion, a therapist-facing web dashboard, and a Node.js backend — built to provide emotional support, session tracking, and early crisis detection.

## Architecture

The project is split into three components:

- **live-kit-voice-agent** — Python-based voice AI agent ("Mendy") powered by LiveKit, Groq LLM (Llama 3.1), ElevenLabs TTS, and Silero VAD. Handles real-time voice conversations with users, session logging, and outbound call support.

- **mindflow-therapist-client** — Next.js 14 web app for therapists and users. Features a mood tracker, therapy session scheduling, AI chat, interactive wellness activities (breathing exercises, zen garden, ocean waves), and blockchain-secured session records on Sonic Blaze Testnet.

- **mindflow-therapist-server** — Express + TypeScript REST API backed by MongoDB. Manages auth (JWT), chat history, mood logs, activity tracking, voice session coordination, and outbound call scheduling via Inngest.

## Tech Stack

| Layer | Technologies |
|---|---|
| Voice Agent | Python, LiveKit Agents, Groq (Llama 3.1), ElevenLabs, Silero VAD |
| Frontend | Next.js 14, TypeScript, Tailwind CSS, shadcn/ui, Framer Motion, LiveKit React |
| Backend | Node.js, Express, TypeScript, MongoDB, Inngest, LangChain |
| AI/LLM | Gemini 1.5, GPT-4, LangChain, LangGraph |
| Blockchain | Solidity, Hardhat, Sonic Blaze Testnet, ERC-721 NFTs |
| Auth | JWT, NextAuth, Privy |

## Key Features

- Real-time AI voice companion with crisis detection and empathetic response protocols
- Mood, sleep, and stress tracking with analytics
- Therapist session scheduling and session history
- Blockchain-secured therapy session records with NFT-based progress milestones
- Interactive mindfulness activities and ambient sound therapy
- Outbound call scheduling for proactive check-ins

## Setup

Each sub-project has its own dependencies. See the individual folders for environment variable requirements (`LIVEKIT_*`, `GROQ_API_KEY`, `ELEVENLABS_API_KEY`, `GEMINI_API_KEY`, `MONGODB_URI`).

```bash
# Voice agent
cd live-kit-voice-agent
python -m venv .venv && .venv\Scripts\activate
pip install livekit-agents[groq,silero,turn-detector] python-dotenv
python assistant.py start

# Backend
cd mindflow-therapist-server
npm install && npm run dev

# Frontend
cd mindflow-therapist-client
npm install && npm run dev
```
