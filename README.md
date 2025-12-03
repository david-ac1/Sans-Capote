# Sans-Capote: Voice-First AI Sexual Health Guide

**A stigma-free, voice-driven AI companion for sexual health and HIV prevention in African contexts.**

Combining **Google Gemini** for intelligent conversation and **ElevenLabs** for natural voice output, Sans-Capote provides accessible, private, and culturally-sensitive health guidance via voice or texteven offline.

 **Hackathon Challenge:** ElevenLabs Challenge (Google Cloud Partner Catalyst)
-  ElevenLabs TTS integration with multi-language support
-  Google Gemini AI for conversational responses
-  Voice-first UX (speech input & audio output)
-  Privacy-first (no account needed, no conversation storage)

---

##  Quick Start for Judges

### 1. Setup (2 minutes)
`bash
git clone https://github.com/david-ac1/Sans-Capote.git
cd Sans-Capote
npm install
`

### 2. Add API Keys
Copy .env.example to .env.local and fill in your keys:
`bash
cp .env.example .env.local
# Then edit .env.local with your API keys:
# GEMINI_API_KEY=... (from https://ai.google.dev)
# ELEVENLABS_API_KEY=... (from https://elevenlabs.io/app/api-keys)
# ELEVENLABS_VOICE_ID_EN=... (from https://elevenlabs.io/app/voice-library)
# ELEVENLABS_VOICE_ID_FR=... (optional, for French)
`

### 3. Run
`bash
npm run dev
`
Open [http://localhost:3000](http://localhost:3000) and navigate to **Guide** page.

---

##  How to Test (Demo Guide)

1. **Voice Input:** Click the **Mic** button, speak a question (e.g., "What is PrEP?")
2. **Voice Output:** Hear an AI response read aloud automatically in your language
3. **Read Full:** For long answers, expand with "Read full" to hear the complete response
4. **Playback Speed:** Responses play at 1.2x by default (adjust in Settings)
5. **Language Toggle:** Top-right shows current language (EN/FR) and country code

### Sample Questions to Try
- "What is PrEP and how can I get it in Nigeria?"
- "I had unprotected sex, what should I do?"
- "How do I talk to someone about STI testing?"
- "I'm worried about stigma at the clinic"

---

##  The Problem: Why This Matters

**Global Challenge:**
- 37.7M people living with HIV globally; 80% don't have access to preventive services
- In sub-Saharan Africa, **stigma and privacy concerns** prevent people from seeking health information
- Low-literacy users, poor internet, and misinformation make voice-based education critical

**Sans-Capote's Solution:**
- **Voice-Driven:** For users with limited literacy or privacy concerns
- **Offline-Capable:** Works with spotty connectivity (PWA + local data)
- **Culturally Sensitive:** Country-specific guidance, bilingual (EN/FR), non-judgmental
- **AI-Powered:** Gemini provides intelligent, conversational responses (not scripts)

---

##  Key Features

### Voice Integration (ElevenLabs Challenge)
-  **Speech Recognition:** Ask questions hands-free using your mic
-  **Natural TTS:** Responses played aloud with adjustable speed (1.0x2.0x)
-  **Fallback Logic:** Text truncation & graceful degradation if TTS fails
-  **Multi-Language:** English & French with language-specific voices

### AI Conversation (Gemini)
-  **Multi-Turn Chat:** Full conversation history preserved
-  **Context-Aware:** Responses consider user's language, country, and mode (general/crisis/navigator)
-  **Curated Knowledge:** Responses informed by local resources, services, and best practices
-  **Bite-Sized Answers:** Short preview + "Read full" option for longer content

### Safety & Privacy
-  **No Login Required:** No accounts, no tracking, no data storage
-  **Safety Disclaimers:** Clear messaging that this is educational, not medical advice
-  **Crisis Mode:** Fast guidance for urgent HIV exposure scenarios (PEP within 72 hours)
-  **Local Services:** Recommends real clinics and NGOs in user's country

### Accessibility
-  **Mobile-Optimized:** Dark theme, large touch targets, responsive layout
-  **Inclusive Design:** Non-judgmental language, low-data footprint
-  **Offline Fallback:** Graceful degradation when API is unavailable
-  **Voice Personality:** Warm, conversational AI tone (not robotic)

---

##  Architecture

`
sans-capote/
 src/
    app/
       guide/          # AI Chat with voice input/output
       navigator/      # Country-aware PrEP/PEP guidance
       resources/      # Educational hub (HIV, STIs, consent, mental health)
       crisis/         # Urgent exposure response
       api/
          conversation/  # Gemini conversation endpoint
          voice-out/     # ElevenLabs TTS endpoint
          chat/          # Legacy chat endpoint
       settings-provider.tsx  # Language & country settings
       app-shell.tsx   # Main navigation
    data/               # Curated offline content
       countryGuides.ts
       resources.ts
       servicesDirectory.ts
    i18n/
        strings.ts      # Bilingual UI strings
 public/
    sw.js              # Service worker for PWA
 package.json
`

### Tech Stack
- **Framework:** Next.js 16 (App Router, TypeScript)
- **UI:** React 19, TailwindCSS 4
- **AI:** Google Generative AI (Gemini 2.5 Flash)
- **Voice:** ElevenLabs TTS + Web Speech API
- **Styling:** Dark theme optimized for privacy/readability

---

##  Development

### Running Tests
`bash
npm run dev
# Visit http://localhost:3000/guide
# Test voice, text, and multi-language flows
`

### Build for Production
`bash
npm run build
npm run start
`

### Deploy to Vercel (Recommended)
`bash
npm install -g vercel
vercel
# Follow prompts, add environment variables in Vercel dashboard
`

---

##  What's Measured (Observability)

To support Datadog integration or monitoring, the app logs:
- **Conversation metrics:** Response times, message counts, language/country
- **Voice metrics:** TTS latency, audio file sizes, playback duration
- **Error tracking:** Failed API calls, mic permission denials, timeout events
- **User engagement:** Questions asked, top topics, voice vs. text preferences

See /api/conversation and /api/voice-out for detailed logging.

---

##  Judging Criteria Alignment

| Criterion | Implementation |
|-----------|-----------------|
| **Technological Excellence** | Gemini + ElevenLabs integrated; graceful fallbacks; message caps & validation |
| **Design & UX** | Mobile-optimized, voice-first, dark theme, multi-language support |
| **Potential Impact** | Addresses stigma & access barriers in sub-Saharan Africa; offline-capable |
| **Quality of Idea** | Privacy-first, voice-driven health education; culturally-sensitive guidance |

---

##  License

This project is licensed under the **MIT License** - see [LICENSE](LICENSE) file for details.

---

##  Acknowledgments

- **Google Cloud** for Gemini API and cloud infrastructure
- **ElevenLabs** for natural voice synthesis
- **Global Fund / UNAIDS** for HIV prevention best practices
- Community health workers in African contexts for domain expertise

---

##  Questions?

For hackathon support or technical questions, refer to:
- [Google Gemini API Docs](https://ai.google.dev)
- [ElevenLabs API Docs](https://elevenlabs.io/docs)
- [Next.js Docs](https://nextjs.org/docs)

---

**Built for the ElevenLabs Challenge (Google Cloud Partner Catalyst Hackathon)**
