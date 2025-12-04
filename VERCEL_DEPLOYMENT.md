# Vercel Deployment Checklist

## ✅ Pre-Deployment Setup

### 1. Environment Variables Required

Add these to Vercel Dashboard → Settings → Environment Variables:

| Variable Name | Description | Where to Get It |
|--------------|-------------|-----------------|
| `ELEVENLABS_API_KEY` | ElevenLabs API key for text-to-speech | https://elevenlabs.io/app/settings/api-keys |
| `ELEVENLABS_VOICE_ID_EN` | English voice ID | ElevenLabs Voice Library |
| `ELEVENLABS_VOICE_ID_FR` | French voice ID | ElevenLabs Voice Library |
| `GEMINI_API_KEY` | Google Gemini AI API key | https://aistudio.google.com/app/apikey |
| `GOOGLE_PLACES_API_KEY` | Google Places API key | https://console.cloud.google.com/apis/credentials |

**Important**: Set all variables for all environments (Production, Preview, Development)

### 2. Getting ElevenLabs Voice IDs

1. Go to https://elevenlabs.io/app/voice-library
2. Choose a voice for English (e.g., "Rachel" - professional female)
3. Click voice → Copy Voice ID (format: `21m00Tcm4TlvDq8ikWAM`)
4. Choose a voice for French (e.g., "Bella" - warm female)
5. Copy Voice ID

Recommended voices:
- **English**: Rachel (21m00Tcm4TlvDq8ikWAM) - Clear, professional
- **French**: Bella (EXAVITQu4vr4xnSDxMaL) - Warm, empathetic

### 3. Google Places API Setup

1. Enable APIs in Google Cloud Console:
   - Places API (New)
   - Places API
2. Create API key with restrictions:
   - Restrict to Places API only
   - Add HTTP referrer restrictions for security
3. Copy API key

## 🚀 Deployment Steps

### Option 1: Vercel Dashboard

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Add sentiment analysis and environment checks"
   git push origin main
   ```

2. **Import to Vercel** (if not already done)
   - Go to https://vercel.com/new
   - Import your GitHub repository
   - Vercel auto-detects Next.js

3. **Add Environment Variables**
   - Go to project Settings → Environment Variables
   - Add all 5 variables listed above
   - Select "Production", "Preview", "Development" for each

4. **Trigger Deployment**
   - Go to Deployments tab
   - Wait for automatic deployment
   - Or click "Redeploy" on latest deployment

### Option 2: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Link project (first time only)
vercel link

# Add environment variables
vercel env add ELEVENLABS_API_KEY production
vercel env add ELEVENLABS_VOICE_ID_EN production
vercel env add ELEVENLABS_VOICE_ID_FR production
vercel env add GEMINI_API_KEY production
vercel env add GOOGLE_PLACES_API_KEY production

# Deploy
vercel --prod
```

## ✅ Post-Deployment Verification

### 1. Check Health Endpoint

Visit: `https://your-app.vercel.app/api/health`

Expected response:
```json
{
  "timestamp": "2025-12-04T...",
  "environment": "production",
  "apiKeys": {
    "elevenlabs": true,
    "elevenlabsVoiceEn": true,
    "elevenlabsVoiceFr": true,
    "gemini": true,
    "googlePlaces": true
  },
  "voiceIds": {
    "en": "configured",
    "fr": "configured"
  },
  "status": "ok"
}
```

❌ If you see `"status": "degraded"` → missing environment variables

### 2. Test Core Features

| Feature | Test URL | Expected Result |
|---------|----------|----------------|
| Home page | `/` | Loads without errors |
| Guide (AI Chat) | `/guide` | Chat interface works |
| Voice output | Type message → wait for audio | Voice plays |
| Navigator | `/navigator` | Clinic map loads |
| Places API | Fill form → search clinics | Real-time data shows |
| Sentiment | Type anxious message | Emotion badge appears |

### 3. Check Browser Console

Open DevTools (F12) and look for:
- ✅ No red errors
- ✅ API calls return 200 status
- ❌ Avoid: "ELEVENLABS_API_KEY is not configured"
- ❌ Avoid: "Failed to fetch" errors

### 4. Test Sentiment Analysis

1. Go to `/guide`
2. Type: "I'm very worried, what should I do?"
3. Verify:
   - Emotion badge shows (yellow "Anxious")
   - Voice tone is empathetic
   - Suggestions are relevant

### 5. Test Places API

1. Go to `/navigator`
2. Fill form (select country, exposure details)
3. Enable location or enter city
4. Verify:
   - Clinics show with "Open now" badges
   - Distance calculated correctly
   - Google ratings visible

## 🔧 Troubleshooting

### Error: "ELEVENLABS_API_KEY is not configured"

**Cause**: Environment variable not set in Vercel

**Fix**:
1. Go to Vercel Dashboard → Settings → Environment Variables
2. Add `ELEVENLABS_API_KEY` with your key
3. Redeploy (Deployments → Redeploy)

### Error: "Too many concurrent requests" (ElevenLabs)

**Cause**: Free tier ElevenLabs allows 3 concurrent requests

**Fix Options**:
1. Upgrade ElevenLabs plan
2. Add request queuing (future enhancement)
3. Reduce auto-play features during testing

### Error: "Failed to generate speech"

**Causes**:
1. Invalid voice ID
2. API key expired
3. ElevenLabs quota exceeded

**Fix**:
1. Check `/api/health` endpoint
2. Verify voice IDs are correct
3. Check ElevenLabs dashboard for quota

### Places API Not Working

**Causes**:
1. `GOOGLE_PLACES_API_KEY` not set
2. Places API not enabled in Google Cloud
3. API key restrictions too strict

**Fix**:
1. Enable Places API (New) in Google Cloud Console
2. Check API key restrictions
3. Verify billing is enabled (Places API requires it)

### Build Fails on Vercel

**Common Issues**:
1. TypeScript errors → Run `npm run build` locally first
2. Missing dependencies → Check `package.json`
3. Node version → Vercel uses Node 18+ by default

**Fix**:
```bash
# Test build locally
npm run build

# Check for errors
npm run lint
```

## 📊 Monitoring

### Vercel Analytics

- Enable in Settings → Analytics
- Track:
  - Page views
  - Core Web Vitals
  - API response times

### Custom Logging

Check Vercel Logs (Dashboard → Logs) for:
- API errors
- Sentiment analysis triggers
- Crisis interventions
- ElevenLabs quota usage

### Success Metrics

Week 1 targets:
- ✅ All 5 environment variables configured
- ✅ Zero 503 errors on TTS endpoint
- ✅ Sentiment analysis working on all messages
- ✅ Places API showing real-time clinic data
- ✅ Voice playback working in both EN/FR

## 🔐 Security Checklist

- ✅ API keys stored in Vercel environment (not in code)
- ✅ `.env.local` in `.gitignore`
- ✅ Rate limiting enabled on all API routes
- ✅ Input sanitization on user-submitted text
- ✅ CORS configured correctly
- ✅ API key restrictions set in Google Cloud

## 🚨 Production Considerations

### Before Going Live

1. **API Quotas**
   - ElevenLabs: Check character limits
   - Gemini: Monitor token usage
   - Places API: Set daily limits

2. **Error Tracking**
   - Consider Sentry integration
   - Set up error alerts
   - Monitor API failure rates

3. **Caching**
   - Implement Redis for emotional journey tracking
   - Cache Places API responses (1 hour)
   - Cache TTS responses for common phrases

4. **Database**
   - Move from in-memory to persistent storage
   - Track user sessions across refreshes
   - Store analytics data

## 📞 Support

If issues persist:
1. Check Vercel logs: Dashboard → Logs
2. Test `/api/health` endpoint
3. Verify all environment variables set
4. Check API provider dashboards for quota/errors

## ✅ Deployment Complete!

Once all checks pass:
- ✅ Share URL with testers
- ✅ Monitor first user sessions
- ✅ Track sentiment analysis accuracy
- ✅ Gather feedback on voice tone
- ✅ Prepare for ElevenLabs hackathon submission!

**Your deployment URL**: Check Vercel Dashboard for production URL

Next: Continue to Phase 2C (Voice Streaming) or Phase 2D (SMS Follow-up)
