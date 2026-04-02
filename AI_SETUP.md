# AI Assistant Setup (Groq - FREE!)

The AI Assistant is powered by **Groq**, which is completely **FREE** with generous limits.

## Quick Setup

1. **Get your Groq API key** (takes 1 minute):
   - Visit https://console.groq.com/keys
   - Sign up (free) or log in
   - Create a new API key
   - Copy it

2. **Create `.env.local`** in the project root:
   ```
   GROQ_API_KEY=gsk_your_api_key_here_from_groq_console
   NEXTAUTH_SECRET=your_nextauth_secret
   NEXTAUTH_URL=http://localhost:3000
   GOOGLE_CLIENT_ID=your_google_oauth_client_id
   GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret
   ```

3. **Restart dev server**:
   ```bash
   npm run dev
   ```

## Features

- **AI Assistant Button**: Click the "🤖 AI" button in the header to open the chat
- **Code Suggestions**: The AI suggests code wrapped in code blocks
- **Apply Code**: Use the "✓ Apply" button to insert code at your cursor or replace selected text
- **Copy Code**: Use the "📋 Copy" button to copy code to clipboard
- **Free & Fast**: Groq is super fast and gives you free API access

## Why Groq?

✅ **Completely Free** - No credit card needed
✅ **Fast** - 10x faster than other free alternatives
✅ **Generous Limits** - ~5000 requests/day
✅ **OpenAI Compatible** - Uses the same API format
✅ **Great for Code** - Mixtral model is excellent at coding tasks

## Troubleshooting

- **"Groq API key not configured"**: Make sure `.env.local` has `GROQ_API_KEY=gsk_...`
- **Chat not responding**: Check browser console (F12) for error messages
- **API key invalid**: Verify your key at https://console.groq.com/keys
- **Rate limited**: Free tier has ~5000 requests/day. Wait a bit or create a new key

## How to Use

1. Click the **🤖 AI** button in the top bar
2. Type your question or request
3. AI will respond with suggestions
4. Click **✓ Apply** to insert code, or **📋 Copy** to copy it
5. The AI has full context of your current code and language

## API Integration

- **Route:** `/api/ai-chat`
- **Model:** Mixtral-8x7b-32768 (excellent for coding)
- **Max outputs:** 1000 tokens per request
- **Free tier:** ~5000 requests/day

## Notes

- Your code is only sent for AI inference - it's not stored
- The AI includes your current code as context for better suggestions
- You can have multiple conversations and each one maintains history
