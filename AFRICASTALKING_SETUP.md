# Africa's Talking SMS Setup Guide

This guide will help you set up SMS notifications for Sans-Capote using Africa's Talking.

## Why Africa's Talking?

- **Best coverage** for African countries (Nigeria, Kenya, Uganda, Ghana, Rwanda, South Africa, etc.)
- **Lower cost** than Twilio for African SMS (~$0.01 per SMS)
- **Reliable delivery** even in rural areas
- **Easy setup** with sandbox for testing

## Step 1: Create Africa's Talking Account

1. Go to [Africa's Talking](https://africastalking.com/)
2. Click **Sign Up** (free account)
3. Verify your email address
4. Complete your profile

## Step 2: Get Your Credentials

### Sandbox (for testing)

1. Go to [Sandbox](https://account.africastalking.com/apps/sandbox)
2. Copy your **Username**: `sandbox`
3. Click **Settings** → **API Key** → **Create API Key**
4. Copy your API Key (starts with `atsk_...`)

### Production (for live deployment)

1. Add funds to your account (minimum $5 USD)
2. Go to [Production Dashboard](https://account.africastalking.com/apps)
3. Create a new app or use default
4. Copy your **Username** (your app name)
5. Click **Settings** → **API Key** → **Create API Key**
6. Copy your API Key

## Step 3: Configure Environment Variables

Add these to your `.env.local` file:

```bash
# Africa's Talking SMS Configuration
AFRICASTALKING_USERNAME=sandbox  # or your production app name
AFRICASTALKING_API_KEY=atsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
AFRICASTALKING_SENDER_ID=SANSCP  # Max 11 characters (optional)
```

### Sender ID Notes
- **Sandbox**: Uses default sender (usually "AT2FA" or "20880")
- **Production**: You can request a custom sender ID (takes 1-2 days approval)
- **Format**: Alphanumeric, max 11 characters, no spaces
- **Recommendation**: Use `SANSCP` or `SansCapote`

## Step 4: Test SMS Sending

### Using Sandbox

1. Add test phone numbers in [Sandbox Settings](https://account.africastalking.com/apps/sandbox/sms/phonenumbers)
2. Use the format: `+254XXXXXXXXX` (must include country code)
3. Click **"Send to My Phone"** in the app
4. Check your phone for the SMS

### Testing Script

Create `test-sms.ts` in your project:

```typescript
const AfricasTalking = require('africastalking');

const client = AfricasTalking({
  apiKey: 'YOUR_API_KEY',
  username: 'sandbox',
});

const sms = client.SMS;

sms.send({
  to: ['+254XXXXXXXXX'], // Your phone number
  message: 'Test SMS from Sans-Capote',
  from: 'SANSCP',
})
  .then((response: any) => {
    console.log('✅ SMS sent:', response);
  })
  .catch((error: any) => {
    console.error('❌ Error:', error);
  });
```

Run: `npx ts-node test-sms.ts`

## Step 5: Supported Countries

Africa's Talking supports SMS to these countries:

| Country | Code | Sample Number |
|---------|------|---------------|
| Nigeria | +234 | +234 801 234 5678 |
| Kenya | +254 | +254 712 345 678 |
| Uganda | +256 | +256 712 345 678 |
| Ghana | +233 | +233 24 123 4567 |
| Rwanda | +250 | +250 788 123 456 |
| South Africa | +27 | +27 82 123 4567 |
| Tanzania | +255 | +255 754 123 456 |
| Ethiopia | +251 | +251 91 123 4567 |

## Step 6: Production Checklist

Before going live:

- [ ] Switch from `sandbox` to production username
- [ ] Add sufficient credits ($10-20 recommended)
- [ ] Request custom sender ID (optional but professional)
- [ ] Test with real phone numbers in each country
- [ ] Set up rate limiting (already implemented: 3 SMS/hour per number)
- [ ] Monitor SMS delivery reports in dashboard

## Rate Limits

**Built-in limits** (in `/api/sms/route.ts`):
- 3 SMS per phone number per hour
- Prevents spam and abuse
- Can be adjusted by changing `MAX_SMS_PER_HOUR`

**Africa's Talking limits**:
- Sandbox: 100 SMS per day
- Production: Based on your account credits

## Cost Estimates

### Per SMS Pricing (approximate)
- Nigeria: $0.008 - $0.012
- Kenya: $0.008 - $0.010
- Uganda: $0.010 - $0.015
- Ghana: $0.012 - $0.018
- Rwanda: $0.015 - $0.020
- South Africa: $0.005 - $0.008

### Expected Usage
- 100 users/day × 1 SMS each = $0.80 - $1.50/day
- 3,000 users/month = $24 - $45/month

## Troubleshooting

### Error: "Invalid phone number"
- ✅ Use E.164 format: `+234XXXXXXXXX`
- ✅ Include country code
- ✅ No spaces or dashes

### Error: "Insufficient balance"
- Add credits to your account
- Minimum $5 for production

### Error: "API_KEY not configured"
- Check `.env.local` file
- Restart dev server after adding variables

### SMS not received
- Check spam folder (rare)
- Verify phone number is correct
- Check delivery report in Africa's Talking dashboard
- Sandbox: Ensure number is added to approved list

## API Reference

### POST `/api/sms`

**Request:**
```json
{
  "phoneNumber": "+234XXXXXXXXX",
  "service": {
    "name": "Test Clinic",
    "address": "123 Main St",
    "phone": "+234 123 4567",
    "services": ["PrEP", "PEP", "HIV Testing"],
    "hours": "Mon-Fri 9AM-5PM",
    "rating": 4.5
  }
}
```

**Response (success):**
```json
{
  "success": true,
  "message": "SMS sent successfully",
  "cost": "KES 1.0000",
  "messageId": "ATXid_xxxxxxxxxxxxxxxx"
}
```

**Response (error):**
```json
{
  "error": "Rate limit exceeded. Maximum 3 SMS per hour."
}
```

## Next Steps

1. Test in sandbox with your phone
2. Add $10 credits for production
3. Deploy to Vercel with production credentials
4. Monitor usage in Africa's Talking dashboard
5. Request custom sender ID for branding

---

**Questions?**
- [Africa's Talking Docs](https://developers.africastalking.com/docs/sms/overview)
- [API Reference](https://developers.africastalking.com/docs/sms/sending)
- [Support](https://help.africastalking.com/)
