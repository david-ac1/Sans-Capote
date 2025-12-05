# Supabase Setup Guide for Sans-Capote

## 1. Create a Supabase Project

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Click **"New Project"**
3. Fill in:
   - **Name**: `sans-capote` (or your preferred name)
   - **Database Password**: (Generate a strong password - save it securely)
   - **Region**: Choose closest to your users (e.g., `Frankfurt` for Europe/Africa)
4. Click **"Create new project"** (takes ~2 minutes)

## 2. Get Your API Credentials

1. Once created, go to **Project Settings** (⚙️ icon)
2. Click **"API"** in the left sidebar
3. Copy these values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

## 3. Update .env.local

Replace the placeholder values in `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

## 4. Run the SQL Setup

1. In your Supabase project, click **"SQL Editor"** in the left sidebar
2. Click **"New query"**
3. Copy the entire contents of `supabase-setup.sql`
4. Paste into the SQL editor
5. Click **"Run"** (bottom right)
6. You should see: ✅ **Success. No rows returned**

## 5. Verify the Setup

### Check the Table
1. Click **"Table Editor"** in the left sidebar
2. You should see the `service_ratings` table
3. Click on it to view the structure

### Check RLS Policies
1. Click on `service_ratings` table
2. Click the **🛡️ "RLS"** tab at the top
3. You should see 4 policies:
   - ✅ Anyone can view ratings (SELECT)
   - ✅ Anyone can submit ratings (INSERT)
   - ✅ No updates allowed (UPDATE - disabled)
   - ✅ No deletes allowed (DELETE - disabled)

## 6. Test the Integration

1. Restart your dev server: `npm run dev`
2. Navigate to `/navigator`
3. Click on any service marker
4. In the service details panel:
   - Click **"+ Add Rating"**
   - Fill in the rating form
   - Click **"Submit Rating"**
5. You should see:
   - ✅ Success message appears
   - Community ratings summary shows your rating
6. Verify in Supabase:
   - Go to **Table Editor** → `service_ratings`
   - You should see your rating row

## 7. Optional: Add Sample Data

To test the aggregation display, you can insert sample ratings:

```sql
INSERT INTO service_ratings (service_id, friendliness, privacy, wait_time, judgement_free, comment) VALUES
('ng_ahf_lagos', 5, 5, 4, true, 'Very welcoming staff, quick service!'),
('ng_ahf_lagos', 4, 5, 3, true, 'Great privacy, but had to wait a bit'),
('ng_ihvn_abuja', 5, 4, 5, true, 'Excellent experience overall'),
('za_tb_hiv_cape_town', 5, 5, 5, true, 'Highly recommend, felt very safe');
```

## Features Enabled

✅ **Anonymous Submissions**: No login required to rate services
✅ **Public Ratings**: Anyone can view all ratings
✅ **Immutable Records**: Ratings cannot be edited or deleted (prevents manipulation)
✅ **Aggregated Stats**: Auto-calculates averages and percentages
✅ **Indexed Queries**: Fast lookups by service_id
✅ **Real-time Updates**: Ratings appear immediately after submission

## Security Features

- **Row Level Security (RLS)**: Enabled to control data access
- **Check Constraints**: Ensures ratings are between 1-5
- **No Authentication Required**: Privacy-first approach for sensitive health services
- **Immutable**: Once submitted, ratings cannot be changed (builds trust)

## Monitoring

### View Recent Ratings
```sql
SELECT * FROM service_ratings 
ORDER BY created_at DESC 
LIMIT 10;
```

### Check Aggregates
```sql
SELECT * FROM service_rating_aggregates 
ORDER BY total_ratings DESC;
```

### Find Top-Rated Services
```sql
SELECT service_id, avg_friendliness, avg_privacy, total_ratings
FROM service_rating_aggregates
WHERE total_ratings >= 3
ORDER BY (avg_friendliness + avg_privacy) / 2 DESC
LIMIT 10;
```

## Troubleshooting

### Error: "Failed to submit rating"
- Check that `.env.local` has correct credentials
- Verify RLS policies are enabled in Supabase
- Check browser console for detailed error message

### Ratings not appearing
- Refresh the service details panel
- Check Supabase Table Editor to verify data was inserted
- Verify `SELECT` RLS policy is enabled

### "Supabase credentials not configured" warning
- Make sure `.env.local` has both URL and anon key
- Restart dev server after updating env vars
- Values must start with `NEXT_PUBLIC_` to be available in browser

## Cost

Supabase Free Tier includes:
- ✅ 500 MB database storage
- ✅ 1 GB file storage
- ✅ 2 GB bandwidth per month
- ✅ 50,000 monthly active users

This should be sufficient for the Sans-Capote project. Ratings are small (~500 bytes each), so 500 MB = ~1 million ratings.

## Next Steps

Consider adding:
- Rate limiting (max 1 rating per service per IP per day)
- Moderation dashboard for flagged comments
- Email notifications for service providers
- Analytics dashboard for rating trends
