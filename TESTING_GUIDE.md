# 🚀 Quick Start: Testing the Voice Quiz

## Immediate Testing Steps

### 1. **Start Development Server**
```bash
cd c:\Users\david\Desktop\sans-capote
npm run dev
```

### 2. **Open Resources Page**
Navigate to: `http://localhost:3000/resources`

---

## 🎮 Test Scenarios

### Scenario A: Full Quiz Flow (5 minutes)
1. **Click "Take Quiz" tab** (purple button)
2. **Read intro screen** → Click "🚀 Start Quiz"
3. **Question 1**: Click "🔊 Read Question" (ElevenLabs reads)
4. **Answer via voice**: Click "🎤 Speak Your Answer" → Say "B"
   - Should see transcript: "You said: B"
   - Green checkmark + confetti animation
5. **Answer via tap**: Click option "C" directly
6. **Use lifeline**: Click "💡 Ask AI" → Gemini hint appears
7. **Complete 15 questions**: See final score screen
8. **Generate certificate**:
   - Enter name: "David Achieng"
   - Click "📥 Download Certificate"
   - PNG file downloads
9. **Share**: Click "💬 WhatsApp" → Message opens

### Scenario B: Emergency Hotlines (2 minutes)
1. **"🚨 Emergency Hotlines" tab** (red button)
2. **Scroll through 6 countries**: Nigeria → Rwanda
3. **Tap phone number**: "6222" (Nigeria)
   - Should open phone dialer
4. **Test language switch**: Click "🇫🇷 Français"
   - All content switches to French

### Scenario C: Certificate Preview (1 minute)
1. **Complete quiz** (or reload if already done)
2. **"🎓 Certificate" tab** appears
3. **View certificate preview**: Name, score, grade, date
4. **Test download**: Enter name → "📥 Download"
5. **Check file**: `HIV-Education-Certificate-Your-Name.png`

---

## 🎤 Voice Recognition Tips

### If Voice Input Doesn't Work:
1. **Check browser**: Chrome/Edge (not Firefox on Windows)
2. **Allow microphone**: Browser prompts for permission
3. **Speak clearly**: "A", "B", "C", or "D"
4. **Fallback**: Tap options directly (always works)

### Test Voice Recognition:
```
Question: "What does HIV stand for?"
Options: A. Human Immunodeficiency Virus, B. Health Infection Virus...

Say: "A" ✅
Say: "Human Immunodeficiency Virus" ✅
Say: "The first one" ❌ (won't match)
```

---

## 🐛 Troubleshooting

### Issue: No confetti animation
**Fix**: Check browser console for script errors. CDN scripts should load:
- `canvas-confetti@1.9.2`
- `html2canvas@1.4.1`

### Issue: "Ask AI" lifeline stuck
**Fix**: Check Gemini API key in `.env.local`:
```env
GEMINI_API_KEY=AIzaSyCgGmideQC0gm7hKWmqSdy31G6EerEi10I
```

### Issue: No voice playback
**Fix**: Check ElevenLabs API key:
```env
ELEVENLABS_API_KEY=sk_5951cbc847247e41cb12e1a125893b95536240f8ac5b7974
ELEVENLABS_VOICE_ID_EN=neMPCpWtBwWZhxEC8qpe
ELEVENLABS_VOICE_ID_FR=zAr1POVZUrr1zkX0T94t
```

### Issue: Certificate won't download
**Fix**: html2canvas library loading. Check:
1. Browser console: `window.html2canvas` should exist
2. Alternative: Click "Print" (fallback)

---

## 📱 Mobile Testing

### On Your Phone
1. **Find IP**: `ipconfig` → IPv4 (e.g., 192.168.1.100)
2. **Open**: `http://192.168.1.100:3000/resources`
3. **Test voice**: Microphone permission required
4. **Test hotlines**: Tap-to-call should work
5. **Test certificate**: Download to phone gallery

---

## 🎯 Key Features to Demo

### For Video Recording:
1. **Hotlines** (0:20): Scroll countries → Tap Nigeria 6222
2. **Quiz Intro** (0:15): "🚀 Start Quiz" → How to Play
3. **Voice Answer** (0:30): Question → "🎤 Speak" → "B" → ✅ + 🎉
4. **AI Lifeline** (0:20): "💡 Ask AI" → Hint appears
5. **Certificate** (0:30): Final score → Name → Download → WhatsApp

### Screenshots to Capture:
- Emergency hotlines grid (6 flags)
- Quiz question with 4 options
- Confetti animation on correct answer
- Certificate with score/grade
- WhatsApp share preview

---

## ✅ Pre-Demo Checklist

- [ ] Dev server running (`npm run dev`)
- [ ] Browser: Chrome/Edge (for speech recognition)
- [ ] Microphone: Allowed in browser permissions
- [ ] Audio: Speakers/headphones on (for TTS)
- [ ] Network: Internet connected (API calls)
- [ ] Screen recorder: OBS/Loom ready
- [ ] Phone: Connected to same WiFi (for mobile test)

---

## 🏆 Demo Script (90 seconds)

**[Open to hotlines tab]**
"When someone suspects HIV exposure, every minute counts. We provide 12 verified emergency hotlines across 6 African countries. Tap any number to call immediately—24/7, free, confidential."

**[Switch to quiz tab]**
"But prevention starts with education. Our voice-first quiz combats misinformation. Watch—"

**[Start quiz, click read question]**
"ElevenLabs reads the question..."

**[Click speak, say "B"]**
"I speak my answer—B. Correct! Confetti celebrates learning."

**[Show lifeline]**
"Stuck? Ask AI. Gemini provides a hint without giving away the answer."

**[Complete quiz fast-forward]**
"15 questions later..."

**[Show certificate]**
"I get a personalized certificate. Download it, share it on WhatsApp. Each share spreads awareness, combating the stigma that affects 80% of people living with HIV."

**[End on hotlines]**
"From crisis intervention to education to empowerment—Sans Capote saves lives."

---

## 🎓 Sample Quiz Questions to Test

### Easy (100 points)
- "What does HIV stand for?" → A. Human Immunodeficiency Virus
- "Can you get HIV from hugging?" → B. No

### Medium (200 points)
- "How long for ART to achieve undetectable?" → B. Usually 3-6 months
- "Does PrEP protect against other STIs?" → B. No, only HIV

### Hard (500 points)
- "What does U=U mean?" → B. Undetectable=Untransmittable
- "How soon after exposure must PEP be started?" → B. Within 72 hours

---

## 📊 Success Indicators

✅ **Quiz loads**: 15 random questions appear  
✅ **Voice works**: Transcript shows "You said: B"  
✅ **Confetti**: Animation plays on correct answer  
✅ **AI hint**: Gemini response appears  
✅ **Certificate**: PNG downloads successfully  
✅ **Hotlines**: Phone dialer opens  
✅ **Bilingual**: French translations load  

---

## 🚀 Ready to Test!

Start with: `npm run dev`  
Then navigate to: `http://localhost:3000/resources`

**Estimated testing time: 10-15 minutes for full flow**

Good luck! 🎉
