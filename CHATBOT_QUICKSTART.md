# ChatBot Quick Start Guide

## What's Been Added

Your MyTravelTown application now has an AI-powered travel assistant chat bot! Here's what was implemented:

### ✅ Files Created/Modified:

1. **New Component**: `src/components/ChatBot.tsx`
   - Circular chat button (bottom-right corner)
   - Full chat interface with message history
   - Gemini AI integration
   - Travel-focused responses

2. **Configuration Files**:
   - `.env.local` - Your API key goes here
   - `.env.example` - Template for setup
   - `CHATBOT_SETUP.md` - Detailed documentation

3. **Updated Files**:
   - `src/App.tsx` - Added ChatBot component
   - `package.json` - Added `@google/generative-ai` dependency

---

## 🚀 Quick Setup (3 Steps)

### Step 1: Get Your Free Gemini API Key
1. Go to [https://ai.google.dev/](https://ai.google.dev/)
2. Click "Get API Key"
3. Create a new API key (free tier available)
4. Copy the key

### Step 2: Add API Key to Project
1. Open `.env.local` file in the project root
2. Replace the empty value:
   ```
   VITE_GEMINI_API_KEY=paste_your_key_here
   ```
3. Save the file

### Step 3: Install & Run
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

That's it! The chat bot will appear in the bottom-right corner of your app.

---

## 💬 Chat Bot Features

### What It Can Do:
✅ Explain travel packages and features  
✅ Help identify best holiday packages  
✅ Answer questions about destinations  
✅ Recommend packages based on budget/duration  
✅ Discuss hotel ratings, meals, flight options  
✅ Help with domestic and international travel planning  

### What It Won't Do:
❌ Answer non-travel questions  
❌ Respond to technical/non-related queries  
✅ But it will politely redirect back to travel topics  

---

## 🎨 Chat Bot Appearance

- **Location**: Fixed circular button in bottom-right corner
- **Button**: Message circle icon (or X when open)
- **Color**: Brand color (primary)
- **Size**: Responsive and mobile-friendly
- **Animation**: Smooth fade-in/slide-in when opened

---

## 🔧 Testing the Bot

Once running, try these questions:

1. **"What packages do you have for a 5-day vacation to Goa?"**
2. **"I have a budget of ₹50,000 for 2 people, what can you suggest?"**
3. **"What's the difference between domestic and international packages?"**
4. **"Can you recommend a package with 4-star hotels and all meals included?"**

---

## 📋 File Structure

```
peek-a-search/
├── src/
│   ├── components/
│   │   ├── ChatBot.tsx          ← NEW: Chat bot component
│   │   └── site/
│   │       └── ...
│   ├── App.tsx                  ← MODIFIED: Added ChatBot
│   └── ...
├── .env.local                   ← NEW: Add your API key here
├── .env.example                 ← NEW: Template file
├── CHATBOT_SETUP.md             ← NEW: Full documentation
├── package.json                 ← MODIFIED: Added dependency
└── ...
```

---

## ⚠️ Important Notes

- **API Key Security**: Never commit `.env.local` to git (already in .gitignore)
- **Free Tier**: Google offers free tier with rate limits
- **No Key Setup**: Chat button will be disabled if API key is not configured
- **Development Only**: This is for development; ensure proper security for production

---

## 🆘 Troubleshooting

| Issue | Solution |
|-------|----------|
| Chat button is grayed out | Add API key to `.env.local` |
| "API error" messages | Verify API key is correct |
| Messages not sending | Check internet connection |
| Chat not appearing | Refresh page, clear browser cache |

---

## 📚 Resources

- [Google Gemini Documentation](https://ai.google.dev/)
- [Full Setup Guide](./CHATBOT_SETUP.md)
- [Component Code](./src/components/ChatBot.tsx)

---

## ✨ Next Steps

1. Get your API key from Google AI Studio
2. Add it to `.env.local`
3. Run `npm install`
4. Start your dev server with `npm run dev`
5. Test the chat bot in the bottom-right corner!

Happy travels! 🌍✈️
