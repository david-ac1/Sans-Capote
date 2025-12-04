# Google Places API Integration Test

## Testing the Real-Time Service Availability Feature

### Setup Verification
1. ✅ API key added to `.env.local` as `GOOGLE_PLACES_API_KEY`
2. ✅ Server endpoint `/api/places` deployed
3. ✅ Integration added to Navigator page

### How to Test

#### 1. Navigate to the Navigator Page
```
http://localhost:3000/navigator
```

#### 2. Click "Begin" and Fill Out the Form
- Enter hours since exposure (e.g., "24")
- Select exposure type
- Submit to see results

#### 3. Enable Location Services
- Click "Use my location" button
- Grant browser permission when prompted
- This enables distance calculation and sorting

#### 4. Look for Real-Time Status Badges
You should see:
- 🟢 **"Open now"** badge (green) for currently open clinics
- 🔴 **"Closed"** badge (red) for closed clinics  
- 📍 **Distance** badge (blue) showing km from your location
- ⭐ **Rating** badge (yellow) with Google reviews score

#### 5. Verify Sorting
Clinics should be automatically sorted by:
1. Open now (at the top)
2. Distance from user
3. Rating score

#### 6. Check Loading State
- When the page loads, you should see "Loading..." indicator
- This fetches real-time data from Google Places API

### Expected Behavior

**With API Key Configured:**
- ✅ Real-time open/closed status appears
- ✅ Distance calculation works with user location
- ✅ Google ratings displayed
- ✅ Clinics sorted by availability

**Without API Key or Offline:**
- ⚠️ Gracefully falls back to basic clinic list
- ⚠️ No status badges shown (feature disabled)
- ✅ App continues to work normally

### Troubleshooting

#### No status badges appearing?
1. Check browser console for errors
2. Verify API key in `.env.local`
3. Restart dev server: `npm run dev`
4. Check API key permissions in Google Cloud Console

#### "Loading..." stuck?
1. Check network tab for `/api/places` requests
2. Verify Google Places API is enabled in console
3. Check rate limits (50 requests/min)

#### Wrong clinic information?
- Places API searches by name + location
- May need to add more specific location data to servicesDirectory.ts
- Check clinic coordinates (lat/lng) are accurate

### API Usage Notes

**Cost Optimization:**
- Only fetches when navigator results page is shown
- Batches requests (max 5 concurrent)
- Rate limited to 50 requests/min
- Consider adding caching in future (Redis/memory)

**Data Freshness:**
- Real-time status fetched on each page load
- Opening hours update automatically
- Distance recalculated when location changes

### Next Steps

Once verified working:
1. Test with different countries (NG, GH, UG, KE, etc.)
2. Test at different times of day (verify open/closed changes)
3. Add more clinics to servicesDirectory with accurate coordinates
4. Consider adding caching layer for frequently accessed clinics
