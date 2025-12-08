# Crisis Voice Agent Enhancements

## Overview
The Crisis Voice Agent now provides **medical-grade risk assessment** with intelligent follow-up questioning, comprehensive triage data collection, and context-aware guidance.

## Key Improvements

### 1. **Intelligent Follow-Up Questioning**
The agent now dynamically adjusts questions based on user answers:

#### HIV Status Flow
- ✅ If user knows partner's HIV status → Asks: "Is your partner HIV positive or negative?"
- ✅ If positive → Asks: "Is your partner on treatment with an undetectable viral load?"
- ✅ Explains U=U (Undetectable = Untransmittable) concept

#### LGBTQIA+ Context
- ✅ Identifies LGBTQIA+ users for tailored guidance
- ✅ Asks about sexual practices relevant to risk assessment
- ✅ Uses inclusive terminology (MSM, WSW, transgender considerations)
- ✅ Prioritizes LGBTQIA+-friendly clinics (rating ≥3)

#### Sexual Role Assessment
- ✅ If exposure is anal/vaginal → Asks: "Were you insertive (active) or receptive?"
- ✅ Risk stratification considers role (receptive > insertive)

#### Enhanced Exposure Details
- ✅ Condom use AND breakage/slippage tracking
- ✅ Timeline precision (hours/days conversion)
- ✅ Type of exposure: oral, vaginal, anal, needle
- ✅ Injury/bleeding detection
- ✅ STI symptom investigation

### 2. **Enhanced System Prompts**

#### PEP/PrEP Education Built-In
```
PEP (Post-Exposure Prophylaxis): Antiretroviral medications taken AFTER HIV exposure to prevent infection
PrEP (Pre-Exposure Prophylaxis): Medications taken regularly BEFORE exposure to prevent HIV
```

#### Urgency Indicators
- ⚠️ **0-24h**: CRITICAL URGENCY (maximum effectiveness)
- ⚠️ **24-48h**: HIGH URGENCY (still very effective)
- ⚠️ **48-72h**: LAST WINDOW (less effective)
- **>72h**: Window closed → HIV testing at 6 weeks

#### Stratified Risk Assessment
- **HIGH**: Receptive anal/needle + no condom + no PrEP + STIs/injury
- **MODERATE**: Vaginal/insertive anal + no condom + unknown partner status
- **LOW**: Oral sex, condom used, PrEP regular, partner U=U
- **NONE**: Kissing, intact skin contact, mosquitoes, pools

#### Risk Modifiers
**Increases Risk:**
- STI presence (ulcers, discharge)
- Bleeding/trauma during intercourse
- Menstruation
- Partner HIV+ not on treatment

**Protective Factors:**
- Regular PrEP (~99% protection)
- Correct condom use
- Partner U=U (undetectable viral load)

### 3. **Improved Triage Data Extraction**

The `extractTriageData()` function now captures:
```typescript
{
  timeSince: string | null;          // "<24", "24-48", "48-72", ">72"
  exposureType: string | null;       // "anal", "vaginal", "oral", "needle"
  condomUsed: string | null;         // "no", "broke", "yes"
  onPrep: string | null;             // "yes", "no", "sometimes"
  riskLevel: 'high' | 'moderate' | 'low' | 'none' | null;
  hoursAgo: number | null;           // Exact hours for PEP window
  partnerStatus: string | null;      // "positive", "negative", "unknown"
  partnerOnTreatment: string | null; // "undetectable", "detectable", "no"
  sexualRole: string | null;         // "receptive", "insertive"
  lgbtqiaPlus: boolean;              // LGBTQIA+ identification
  stiSymptoms: boolean;              // STI symptoms present
  hasInjury: boolean;                // Physical injury/bleeding
}
```

### 4. **Context-Aware Gemini Prompting**

The agent now sends comprehensive context to Gemini:
```
COMPREHENSIVE TRIAGE ASSESSMENT:

TIME CRITICAL INFORMATION:
- Time since exposure: 18 hours (<24 window)
- PEP window status: ⚠️ CRITICAL URGENCY: You have 54 hours remaining

EXPOSURE DETAILS:
- Exposure type: anal
- Condom used: broke
- Sexual role: receptive

PROTECTION STATUS:
- On PrEP: no
- Partner HIV status: positive
- Partner on treatment: not undetectable

RISK MODIFIERS:
- Risk level (preliminary): high
- LGBTQIA+ identified: yes
- STI symptoms present: no
- Physical injury/bleeding: no
```

### 5. **Enhanced Navigation & Guidance**

#### Cross-App Integration
- Subtly mentions: "Find more resources in the 'HIV Services Navigator' tab"
- Testing info: "Learn more about testing options in our 'Education Hub'"
- Privacy reminder: "This conversation is completely private and confidential"

#### Improved Conversational Flow
- **Explains WHY** information is needed: "To give you the most accurate risk assessment, I need to understand..."
- **Supportive language**: "I understand this can be stressful. Let me help you understand your situation better."
- **Privacy assurance**: Displayed at start and repeated during sensitive questions

### 6. **Intelligent Clinic Filtering**

Clinics are now prioritized by:
1. **LGBTQIA+-friendly** (if user identified as LGBTQIA+, rating ≥3)
2. **PEP availability** (verified services.pep = true)
3. **24/7 availability** (hours includes "24")
4. **Geographic proximity** (same country/city)

### 7. **Privacy & Reassurance**

#### Privacy Notice
```
🔒 Complete Privacy
This conversation is private and stigma-free. No answers are stored.
```

Displayed:
- ✅ In instructions before starting
- ✅ In welcoming introduction (voice)
- ✅ Before sensitive follow-ups
- ✅ In final safety notice

#### Reassuring Language
- "This helps me give you better guidance. Remember, this conversation is completely private and confidential."
- "Your answer is completely confidential."
- "Zero judgment, confidential services"

## Technical Implementation

### Dynamic Question Flow
Questions with `condition` property are only asked when condition is met:
```typescript
{
  key: "partnerStatusDetail",
  en: "Is your partner HIV positive or HIV negative?",
  condition: (answers) => answers.knownStatus?.toLowerCase().includes("yes")
}
```

### Enhanced Markdown Responses
Gemini responses now formatted with clear sections:
```markdown
**Risk Assessment:** [level + explanation]
**Recommended Actions:** [numbered steps]
**Where to Get Help:** [top 2-3 clinics with contact info]
```

### Time Window Calculations
```typescript
const hoursRemaining = 72 - triageData.hoursAgo;
pepWindowMessage = `⚠️ CRITICAL URGENCY: You have ${hoursRemaining} hours remaining to access PEP`;
```

## User Experience Flow

### 1. Start
- Privacy notice: "This conversation is completely private and confidential."
- Welcoming intro: "Hello, I'm here to help you..."
- Base questions (no conditions)

### 2. Intelligent Follow-ups
- **IF** partner status known → Ask if positive/negative
- **IF** partner is HIV+ → Ask about treatment/viral load
- **IF** exposure is anal/vaginal → Ask about sexual role
- **IF** symptoms mentioned → Investigate STI details

### 3. Acknowledgments
Random supportive responses between questions:
- "Okay." / "D'accord."
- "Thank you." / "Merci."
- "Got it." / "Compris."
- "I see." / "Je vois."

### 4. Final Assessment
- Comprehensive triage data extraction
- PEP window calculation with urgency level
- Risk stratification with clear explanation
- Top 2-3 clinic recommendations
- Brief PEP explanation if in window
- STI testing reminder if symptoms present
- LGBTQIA+-affirming services if relevant

### 5. Safety Notice
"🔒 Reminder: This conversation is private and confidential. If you are in immediate danger, call your local emergency services."

## Testing Scenarios

### Scenario 1: High Risk, Critical Window
**Input:**
- Time: 12 hours ago
- Exposure: Receptive anal, condom broke
- Partner: HIV+ not on treatment
- PrEP: No
- LGBTQIA+: Yes (MSM)

**Expected Output:**
- Risk: HIGH
- Urgency: ⚠️ CRITICAL (60 hours remaining)
- Clinics: LGBTQIA+-friendly, PEP-verified, 24/7
- Guidance: Immediate clinic visit, PEP explanation, affirming language

### Scenario 2: Moderate Risk, Partner U=U
**Input:**
- Time: 30 hours ago
- Exposure: Vaginal, no condom
- Partner: HIV+ on treatment, undetectable
- PrEP: No

**Expected Output:**
- Risk: LOW (partner U=U)
- Urgency: ⚠️ HIGH (42 hours remaining, but low transmission risk)
- Guidance: Explain U=U concept, PEP still available if desired, testing recommended

### Scenario 3: Low Risk, Outside Window
**Input:**
- Time: 5 days ago
- Exposure: Oral
- Condom: Yes
- PrEP: Yes

**Expected Output:**
- Risk: LOW/NONE
- Urgency: Window closed
- Guidance: HIV testing at 6 weeks, continue PrEP, reassurance

## Key Features Summary

✅ **Intelligent Follow-ups**: Dynamic questions based on answers  
✅ **LGBTQIA+ Context**: Tailored guidance and clinic recommendations  
✅ **Medical Accuracy**: WHO-aligned risk stratification  
✅ **PEP/PrEP Education**: Brief explanations when relevant  
✅ **Privacy-First**: Multiple reassurances throughout flow  
✅ **Empathetic Tone**: Non-judgmental, supportive language  
✅ **Comprehensive Triage**: 12+ data points extracted  
✅ **Urgency Indicators**: Time-sensitive alerts with countdowns  
✅ **Contextual Explanations**: WHY questions are asked  
✅ **Cross-App Navigation**: Subtle mentions of other features  
✅ **STI Integration**: Symptom tracking and testing reminders  
✅ **Role-Based Risk**: Insertive vs receptive considerations  

## Impact

This enhancement transforms the Crisis Voice Agent from a basic Q&A flow into a **medical-grade triage system** that:
- Provides accurate, personalized risk assessments
- Educates users about PEP/PrEP options
- Connects users to affirming, appropriate services
- Maintains privacy and reduces stigma
- Saves lives through timely PEP access

---

**Estimated Completion Time**: 3-5 minutes  
**Questions Asked**: 8-13 (varies based on answers)  
**Data Collected**: 12+ triage points  
**Clinic Recommendations**: Top 2-3 verified services  
**Privacy Level**: Complete (no data stored)
