# Sentiment Analysis Integration - Testing Guide

## Overview
The sentiment analysis system detects emotional state and stress levels from user text input, adapting voice tone and response style in real-time.

## Features Implemented

### 1. **Emotion Detection**
- Analyzes text for 7 emotional states: calm, anxious, distressed, confused, angry, hopeful, neutral
- Uses keyword matching and linguistic patterns
- Supports English and French

### 2. **Stress Level Detection**
- Four stress levels: low, moderate, high, critical
- Based on urgency words, negative sentiment, caps lock ratio, repeated words
- Real-time scoring algorithm

### 3. **Adaptive Voice Settings**
- ElevenLabs voice parameters adjust based on emotion:
  - **Distressed**: Stability 0.85 (very calm), Style 0.3 (gentle)
  - **Anxious**: Stability 0.80, Style 0.4 (warm)
  - **Confused**: Stability 0.75, Style 0.2 (clear)
  - **Hopeful**: Stability 0.70, Style 0.5 (upbeat)

### 4. **Adaptive System Prompts**
- Gemini AI instructions change based on emotional state
- Different tone instructions per emotion (reassuring, empathetic, professional, urgent, encouraging)
- Stress-specific adjustments (critical → SHORT + ACTION-ORIENTED)

### 5. **Emotional Journey Tracking**
- Tracks emotional state changes throughout session
- Identifies trends: improving, worsening, stable
- Stored per session ID (in-memory, use Redis in production)

### 6. **Context-Aware Suggestions**
- Question suggestions adapt to emotional state
- Distressed → emergency resources
- Confused → simple explanations
- Hopeful → next steps, support groups

### 7. **Crisis Intervention**
- Automatic crisis notice for critical stress / distressed state
- Bilingual emergency guidance
- Prioritizes immediate safety

## Testing Instructions

### Setup
1. Ensure dev server is running: `npm run dev`
2. Open http://localhost:3000/guide
3. Have browser console open (F12) to see sentiment logs

### Test Case 1: Anxious User
**Input**: "I'm so worried, I think I might have been exposed to HIV last night. What do I do?"

**Expected**:
- Emotional State: anxious or distressed
- Stress Level: moderate or high  
- Suggestions: "What should I do first?", "How soon can I get tested?"
- Voice tone: Empathetic, reassuring
- Response focuses on immediate next steps

### Test Case 2: Confused User
**Input**: "I don't understand the difference between PrEP and PEP. Can you explain?"

**Expected**:
- Emotional State: confused or neutral
- Stress Level: low or moderate
- Suggestions: "Explain PrEP in simple terms", "What are my options?"
- Voice tone: Professional, clear
- Response provides structured explanation

### Test Case 3: Critical Stress
**Input**: "HELP!!! I'm bleeding and terrified. What do I do NOW???"

**Expected**:
- Emotional State: distressed
- Stress Level: critical
- Crisis notice displayed (red banner)
- Suggestions: "Where can I get immediate help?", "Find crisis hotlines"
- Voice tone: Very stable, calming
- Response is SHORT and directs to emergency resources

### Test Case 4: Hopeful User
**Input**: "Thank you, this is helpful! I'm ready to take the next step. Where can I get started with PrEP?"

**Expected**:
- Emotional State: hopeful
- Stress Level: low
- Suggestions: "Where can I start PrEP?", "Tell me about treatment options"
- Voice tone: Encouraging, upbeat
- Response celebrates proactive approach

### Test Case 5: French Language
**Input (French)**: "J'ai très peur, je ne sais pas quoi faire après cette situation."

**Expected**:
- Language detection: fr
- Emotional State: anxious
- French suggestions and crisis notices
- Same adaptive behavior as English

### Test Case 6: Emotional Journey
1. Start anxious: "I'm worried about HIV"
2. Ask follow-up (still anxious): "What are the symptoms?"
3. Ask calming question: "Okay, where can I get tested?"

**Expected**:
- Trend should show: stable → stable → improving
- Sentiment indicator updates each message
- Visual feedback on emotional progress

## UI Components to Verify

### Sentiment Indicator (Compact Mode)
- Location: Below chat messages, above suggestions
- Shows: Emotion badge + stress dots (1-4) + trend arrow
- Color-coded:
  - Green: calm/hopeful
  - Yellow: anxious
  - Red: distressed
  - Blue: confused
  - Orange: angry

### Crisis Notice Banner
- Appears when stress=critical OR emotion=distressed
- Red background with ⚠️ icon
- Bilingual emergency text

### Adaptive Suggestions
- Buttons below chat
- Change based on emotional state
- Click to send suggestion as message

### Voice Playback
- Should use adaptive voice settings
- Distressed users get calmer, softer voice
- Hopeful users get more energetic voice

## API Responses to Inspect

### `/api/conversation` Response
```json
{
  "answer": "...",
  "suggestions": ["...", "...", "..."],
  "safetyNotice": "...",
  "sentiment": {
    "emotionalState": "anxious",
    "stressLevel": "moderate",
    "suggestedTone": "empathetic",
    "trend": "stable"
  },
  "voiceSettings": {
    "stability": 0.80,
    "similarityBoost": 0.75,
    "style": 0.4
  },
  "crisisNotice": "..." // Only if critical
}
```

### `/api/tts` Request
Should include `voiceSettings` parameter when sentiment data is available:
```json
{
  "text": "Response text...",
  "language": "en",
  "voiceSettings": {
    "stability": 0.85,
    "similarityBoost": 0.80,
    "style": 0.3
  }
}
```

## Console Logs to Check

Look for these in browser console:
- `[conversation] Using Gemini answer { ... sentiment: 'anxious', stressLevel: 'moderate' }`
- Session ID should be consistent across messages
- Emotional journey tracker should update

## Known Limitations

1. **In-Memory Storage**: Emotional journey trackers stored in Map (lost on server restart)
   - Production: Use Redis or database
   
2. **Simple Keyword Matching**: Current emotion detection is rule-based
   - Future: Consider ML-based sentiment analysis for better accuracy

3. **English/French Only**: Keyword dictionaries support only en/fr
   - Add more languages as needed

4. **No Persistence**: Session data not saved between page refreshes
   - Consider localStorage for client-side persistence

## Production Considerations

### 1. Store Emotional Journeys in Redis
```typescript
// Replace Map with Redis
import { Redis } from '@upstash/redis';
const redis = new Redis({ url: process.env.REDIS_URL });

// Store journey
await redis.set(`journey:${sessionId}`, JSON.stringify(journey), { ex: 3600 });

// Retrieve journey
const data = await redis.get(`journey:${sessionId}`);
```

### 2. Analytics Integration
Track sentiment metrics:
- Distribution of emotional states
- Average stress levels per session
- Emotional journey trends (improving vs worsening)
- Crisis intervention triggers

### 3. A/B Testing
Compare outcomes:
- With vs without adaptive prompts
- Different voice settings
- Suggestion effectiveness by emotional state

### 4. Privacy Considerations
- Don't log sensitive emotional data with PII
- Anonymize session IDs
- Add data retention policies

## Success Metrics

### User Experience
- ✅ Sentiment indicator visible on every message
- ✅ Voice tone adapts to emotional state
- ✅ Suggestions relevant to user's needs
- ✅ Crisis notices appear for high stress

### Technical
- ✅ No TypeScript errors
- ✅ API responses include sentiment data
- ✅ Voice settings passed to TTS
- ✅ Emotional journey tracks correctly

### Impact
- Monitor: Time to resolution for distressed users
- Track: Engagement with adaptive suggestions
- Measure: Emotional improvement trends

## Troubleshooting

### Sentiment not displaying
- Check browser console for errors
- Verify `/api/conversation` returns sentiment object
- Ensure SentimentIndicator component imported

### Voice not adapting
- Check if voiceSettings passed to `/api/tts`
- Verify ElevenLabs API supports style parameter
- Test with different emotional states

### Crisis notice not showing
- Test with high-stress input (caps, urgency words)
- Check sentiment.stressLevel === 'critical'
- Verify crisisNotice in API response

### Wrong language detected
- Sentiment analysis uses language param from request
- Check guide page passes language to API
- French keywords should trigger French responses

## Next Steps

After testing sentiment analysis, consider:
1. **Voice Streaming** (Phase 2C): Real-time TTS for instant feedback
2. **SMS Follow-up** (Phase 2D): Send clinic info via SMS
3. **Enhanced Analytics**: Track sentiment impact on outcomes
4. **ML Sentiment Model**: Replace keywords with transformer-based NLP

## Files Modified

**Created:**
- `src/lib/sentiment-analysis.ts` - Core sentiment engine
- `src/components/SentimentIndicator.tsx` - UI component
- `SENTIMENT_ANALYSIS_TEST.md` - This file

**Modified:**
- `src/app/api/conversation/route.ts` - Integrated sentiment into Gemini
- `src/app/api/chat/route.ts` - Sentiment-aware chat API
- `src/app/api/tts/route.ts` - Accepts voice settings
- `src/app/guide/page.tsx` - Displays sentiment, passes sessionId

## Questions or Issues?

If sentiment analysis isn't working as expected:
1. Check console for errors
2. Verify API responses include sentiment data
3. Test with extreme emotional inputs (crisis phrases)
4. Ensure sessionId is passed consistently

Ready to test! Start with an anxious message and watch the magic happen. 🎭
