# Mental Health Chat Companion

A compassionate AI-powered mental health companion using Groq's LLM API.

## Features

- 💬 Real-time chat with an empathetic AI companion
- 🧠 Mental health support and guidance
- 🎯 Quick action buttons for common concerns
- 🔒 Privacy-focused conversations
- 📱 Beautiful, accessible UI

## Setup

### 1. Get a Groq API Key

1. Visit [https://console.groq.com](https://console.groq.com)
2. Sign up or log in
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key

### 2. Configure the App

Add your Groq API key to `.env` file:

```env
EXPO_PUBLIC_GROQ_API_KEY=your_actual_groq_api_key_here
```

### 3. Restart the Development Server

After adding the API key, restart your Expo development server:

```bash
# Stop the current server (Ctrl+C)
# Then restart
npx expo start
```

## How It Works

The chat companion uses:
- **Model**: Llama 3.1 70B (via Groq)
- **System Prompt**: Configured as a compassionate mental health companion
- **Features**:
  - Active listening and validation
  - Evidence-based coping strategies
  - Mindfulness guidance
  - Crisis resource awareness
  - Encouragement and support

## Important Notes

⚠️ **This is NOT a replacement for professional mental health care**

The AI companion:
- ✅ Provides emotional support and coping strategies
- ✅ Helps identify thought patterns
- ✅ Encourages healthy habits
- ❌ Does NOT diagnose conditions
- ❌ Does NOT prescribe medication
- ❌ Does NOT replace therapy or counseling

If you're experiencing a mental health crisis:
- 🆘 National Suicide Prevention Lifeline: 988
- 🆘 Crisis Text Line: Text HOME to 741741
- 🆘 International: Find resources at findahelpline.com

## Privacy

- Conversations are sent to Groq's API for processing
- No conversation history is stored permanently
- Clear chat anytime using the trash icon
- Review Groq's privacy policy at groq.com

## Customization

You can customize the companion's behavior by editing the `SYSTEM_PROMPT` in `index.tsx`.
