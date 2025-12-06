# Supabase Setup Guide

## Quick Setup (5 minutes)

### 1. Create Supabase Project
1. Go to https://supabase.com and sign in
2. Click **New Project**
3. Choose a name (e.g., "sans-capote-ratings")
4. Generate a secure database password
5. Select a region (choose closest to your users)
6. Wait ~2 minutes for project creation

### 2. Run SQL Script
1. In your Supabase dashboard, navigate to **SQL Editor**
2. Click **New Query**
3. Copy the entire contents of `supabase-setup.sql` from your project root
4. Paste into the SQL editor
5. Click **Run** (bottom right)
6. You should see: **"Success. No rows returned"**

### 3. Get API Keys
1. Go to **Project Settings** (gear icon in sidebar)
2. Click **API** in the left menu
3. Copy these values:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 4. Add to Environment Variables
Add to your `.env.local` file:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 5. Verify Setup
1. Restart your dev server: `npm run dev`
2. Navigate to http://localhost:3000/navigator
3. Click on any service marker
4. Click **"✍️ Rate this Service"**
5. Submit a test rating
6. Refresh the page - your rating should appear!

## Verify in Supabase Dashboard

### Check Tables
1. Go to **Table Editor** in sidebar
2. You should see `service_ratings` table
3. Click on it to view submitted ratings

### Check Policies (Row Level Security)
1. Click on `service_ratings` table
2. Click **RLS Policies** button (top right)
3. You should see 4 policies:
   - ✅ Anyone can view ratings (SELECT)
   - ✅ Anyone can submit ratings (INSERT)
   - ✅ No updates allowed (UPDATE blocked)
   - ✅ No deletes allowed (DELETE blocked)

### Test Queries
In SQL Editor, try:
```sql
-- View all ratings
SELECT * FROM service_ratings;

-- View aggregated ratings
SELECT * FROM service_rating_aggregates;

-- Count ratings per service
SELECT service_id, COUNT(*) as total_ratings
FROM service_ratings
GROUP BY service_id
ORDER BY total_ratings DESC;
```

## Troubleshooting

### "relation service_ratings does not exist"
- SQL script didn't run successfully
- Re-run `supabase-setup.sql` in SQL Editor

### "Failed to submit rating"
- Check Row Level Security is ENABLED on the table
- Verify the 4 RLS policies exist
- Check API keys are correct in `.env.local`

### Ratings not appearing after submit
- Check browser console for errors
- Verify `NEXT_PUBLIC_SUPABASE_URL` starts with `https://`
- Restart dev server after adding env vars

### Can see ratings but can't submit
- Check INSERT policy exists
- Verify anon key has correct permissions
- Look for CORS errors in browser console

## Production Deployment

### Vercel
Add environment variables in Vercel dashboard:
1. Go to Project Settings → Environment Variables
2. Add both `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Redeploy your app

### Security Notes
- ✅ anon key is safe to expose (public access only)
- ✅ RLS policies prevent data tampering
- ✅ No authentication required for anonymous ratings
- ✅ Ratings are immutable (no edits/deletes)

## Optional: Sample Data

Want to test with sample data? Run this in SQL Editor:
```sql
INSERT INTO service_ratings (service_id, friendliness, privacy, wait_time, judgement_free, comment) VALUES
('ng_ahf_lagos', 5, 5, 4, true, 'Very welcoming staff, quick service!'),
('ng_ahf_lagos', 4, 5, 3, true, 'Great privacy, but had to wait a bit'),
('za_tb_hiv_cape_town', 5, 5, 5, true, 'Excellent service, highly recommend'),
('ke_kenyatta_hiv_centre', 4, 4, 3, true, 'Professional staff, busy during peak hours');
```

Then refresh `/navigator` and you'll see ratings appear!
