# NOVA Auth setup — Google + Email activation

## Email/password signup
NOVA now passes a production callback URL when creating email accounts. Keep **Confirm email** enabled in Supabase Authentication → Providers → Email. A new user receives the activation link in their own inbox and does not need manual approval from the Supabase Users screen.

Set Supabase Authentication → URL Configuration:
- Site URL: your production NOVA URL
- Redirect URL: `https://YOUR-NOVA-DOMAIN/auth/callback`
- Add Vercel preview wildcard only if preview authentication is needed

## Google sign in / sign up
1. Create Google OAuth credentials in Google Cloud
2. In the Google OAuth client, use the Supabase callback URL shown by the Supabase Google provider (normally `https://YOUR-PROJECT-REF.supabase.co/auth/v1/callback`)
3. In Supabase Authentication → Providers → Google, enable Google and paste Client ID + Client Secret
4. Make sure the NOVA production callback `https://YOUR-NOVA-DOMAIN/auth/callback` is allowed under Supabase URL Configuration

The same Google button supports both new-user signup and returning-user sign in.
