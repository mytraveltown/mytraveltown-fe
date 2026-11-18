# MyTravelTown ChatBot Setup Guide

## Overview
This chat bot integration uses Google's Gemini AI API to help users find the perfect travel packages. The bot is available as a circular button at the bottom-right of the screen and only responds to travel-related questions.

## Features
- 🤖 **Travel-focused AI Assistant**: Named "MyTravelTown"
- 💬 **Real-time Chat**: Interactive conversation interface
- 🎯 **Package Recommendations**: Helps identify best holiday packages
- 🚫 **Travel-only Responses**: Politely declines non-travel questions
- 📱 **Responsive Design**: Works on all devices
- ⚡ **Instant Responses**: Powered by Google Gemini API

## Setup Instructions

### Step 1: Get a Google Gemini API Key

1. Visit [Google AI Studio](https://ai.google.dev/)
2. Click on "Get API Key" in the left sidebar
3. Create a new API key (free tier available)
4. Copy your API key

### Step 2: Add the API Key to Your Environment

1. Open `.env.local` in the project root
2. Replace `your_gemini_api_key_here` with your actual API key:
   ```
   VITE_GEMINI_API_KEY=your_actual_api_key_here
   ```
3. Save the file

### Step 3: Install Dependencies

```bash
npm install
```

This will install the `@google/generative-ai` package along with other dependencies.

### Step 4: Run the Development Server

```bash
npm run dev
```

The chat bot will be available at the bottom-right corner of your application.

## How It Works

### User Interaction Flow
1. User clicks the circular chat button in the bottom-right corner
2. Chat window opens showing initial greeting from MyTravelTown bot
3. User types their travel-related question
4. Bot uses Gemini AI to generate contextual travel advice
5. Response is displayed in the chat interface

### Bot Capabilities
- **Package Explanations**: Describes available travel packages and their features
- **Destination Advice**: Provides information about destinations
- **Budget Planning**: Helps identify packages within user's budget
- **Duration Matching**: Suggests packages based on available vacation time
- **Preference-based Recommendations**: Considers hotel ratings, meal options, flight preferences
- **Travel Type Selection**: Helps choose between domestic and international packages

### Travel-Only Constraint
The bot is configured to:
- ✅ Answer travel-related questions
- ✅ Explain packages and features
- ✅ Help with holiday planning
- ❌ Decline non-travel topics politely
- ❌ Redirect users back to travel planning

## Component Structure

### ChatBot Component (`src/components/ChatBot.tsx`)

**Key Features:**
- Circular button toggle (bottom-right fixed position)
- Message history with timestamps
- Typing indicators for loading states
- Auto-scroll to latest messages
- Error handling with user-friendly messages
- Environment variable validation

**Props:** None (standalone component)

**State Management:**
- `isOpen`: Controls chat window visibility
- `messages`: Stores conversation history
- `inputValue`: Current user input
- `isLoading`: Loading state during API calls

## Environment Variables

Create a `.env.local` file in the project root:

```
VITE_GEMINI_API_KEY=your_api_key_here
```

**Note:** 
- This file should be added to `.gitignore` (already configured)
- Never commit your API key to version control
- Use `.env.example` as a template for new developers

## File Changes Summary

### New Files Created:
- `src/components/ChatBot.tsx` - Main chat component
- `.env.example` - Template for environment variables
- `.env.local` - Local environment configuration (not committed)

### Modified Files:
- `src/App.tsx` - Added ChatBot import and component
- `package.json` - Added `@google/generative-ai` dependency

## Customization

### Change Bot Appearance
Edit the styling in `src/components/ChatBot.tsx`:
- Change colors by modifying `bg-brand`, `text-white` classes
- Adjust position with `bottom-6 right-6` values
- Modify dimensions with `w-14 h-14` for button size

### Modify Bot Behavior
Edit the `SYSTEM_PROMPT` constant in `ChatBot.tsx` to:
- Change response tone and style
- Add specific travel packages information
- Modify constraints and guidelines

### Change Chat Window Size
Modify the `w-96 max-h-96` classes in the chat window div

## Troubleshooting

### Chat Bot Button is Disabled/Grayed Out
- **Issue**: API key not configured
- **Solution**: Add your Gemini API key to `.env.local`

### API Errors / "Sorry, I encountered an error"
- **Issue**: Invalid API key or rate limit exceeded
- **Solution**: 
  - Verify your API key is correct
  - Check Google's API console for usage
  - Free tier has rate limits

### Chat Not Sending Messages
- **Issue**: Network issue or API not responding
- **Solution**: 
  - Check internet connection
  - Open browser console for error messages
  - Verify API key is active

### Messages Not Scrolling
- **Issue**: Browser cache issue
- **Solution**: Clear browser cache and refresh

## Best Practices

1. **API Key Security**
   - Never commit `.env.local` to git
   - Use `.env.example` for documentation
   - Rotate keys periodically

2. **User Experience**
   - Keep system prompt focused on travel topics
   - Provide helpful redirect messages for non-travel queries
   - Test with various package-related questions

3. **Maintenance**
   - Monitor API usage in Google's console
   - Update the SDK regularly
   - Keep dependencies up to date

## API Information

- **Provider**: Google Generative AI (Gemini)
- **Model**: `gemini-pro`
- **Free Tier**: Available with rate limits
- **Documentation**: [Google AI Studio](https://ai.google.dev/)

## Support

For issues with:
- **Gemini API**: Check [Google AI Documentation](https://ai.google.dev/)
- **React/TypeScript**: Check project dependencies and types
- **Chat Component**: Review the component code in `src/components/ChatBot.tsx`
