# Domain Configuration Guide - fractown.in

## ✅ Code Updated for fractown.in Domain

The application has been configured to use your custom domain `fractown.in` instead of the default `replit.app` extension.

## Changes Made

### 1. Environment Detection Updated
**File**: `shared/propertyTypes.ts`
- Production environment now detects `fractown.in` domain
- Removed dependency on `replit.app` extension
- Environment detection works for both `fractown.in` and subdomains

### 2. CORS Configuration Updated  
**File**: `config/app.config.js`
- Production CORS origin set to `https://fractown.in`
- Fallback configuration ensures secure cross-origin requests
- Development environment still allows all origins for flexibility

### 3. Server Configuration Enhanced
**File**: `config/app.config.js`
- Server CORS settings updated for production domain
- Environment variable support for `FRONTEND_URL`
- Secure production defaults with `fractown.in`

## Environment Variables for Production

When deploying, you can set these environment variables:

```bash
NODE_ENV=production
FRONTEND_URL=https://fractown.in
CORS_ORIGIN=https://fractown.in
```

## Replit Deployment Domain Setup

Based on the Replit documentation, to use your custom domain `fractown.in`:

### Step 1: Deploy Your App
1. Click the "Deploy" button in your Replit project
2. Your app will initially be available at `[your-repl-name].replit.app`

### Step 2: Configure Custom Domain
1. Go to your **Deployments** tab in Replit
2. Select the **Settings** tab
3. Click **"Link a domain"** or **"Manually connect from another registrar"**
4. Enter your domain: `fractown.in`

### Step 3: DNS Configuration
Replit will provide you with DNS records. Add these to your domain registrar:

**A Record:**
- Name: `@` (or leave blank for root domain)
- Value: [IP address provided by Replit]

**TXT Record:**
- Name: `@` (or leave blank)
- Value: [Verification code provided by Replit]

### Step 4: Subdomain (Optional)
If you want to use `www.fractown.in`:

**CNAME Record:**
- Name: `www`
- Value: `fractown.in`

### Step 5: Wait for Propagation
- DNS changes can take 5 minutes to 48 hours
- Replit will verify your domain once DNS propagates
- Your app will then be accessible at `https://fractown.in`

## Security Benefits

### Enhanced Production Security
- CORS protection limited to your domain only
- No unauthorized cross-origin requests
- Secure cookie and session handling
- Professional domain appearance

### Environment Isolation
- Production automatically detects `fractown.in` domain
- Development continues to work locally
- Data isolation maintained between environments
- Custom field storage remains separated

## Testing Your Domain

### After DNS Configuration
1. **Test Domain Resolution**: `nslookup fractown.in`
2. **Verify HTTPS**: Visit `https://fractown.in`
3. **Check CORS**: Ensure API calls work from your domain
4. **Test Features**: Property export, contact forms, admin functions

### Domain Health Check
```bash
# Test domain connectivity
curl -I https://fractown.in

# Check API endpoint
curl -I https://fractown.in/api/properties
```

## Rollback Plan

If you need to temporarily use the Replit domain:

### Quick Rollback
1. In Replit Deployments → Settings
2. Temporarily disable custom domain
3. Use the generated `[repl-name].replit.app` URL
4. Re-enable custom domain when ready

### Code Rollback (if needed)
The previous configuration supported both domains, so your app will work with either:
- `fractown.in` (production)
- `localhost:5000` (development)
- Replit's generated domain (fallback)

## Production Checklist

Before going live with `fractown.in`:

- [ ] ✅ Code updated for fractown.in domain
- [ ] ✅ CORS configuration secured for production
- [ ] ✅ Environment detection updated
- [ ] ✅ Database backup system ready
- [ ] Deploy app in Replit
- [ ] Configure custom domain in Replit Deployments
- [ ] Add DNS records to your domain registrar
- [ ] Wait for DNS propagation
- [ ] Test all functionality on fractown.in
- [ ] Monitor deployment for any issues

## Support

Your application is now ready to use the `fractown.in` domain. The code changes ensure:

1. **Automatic Domain Detection**: App recognizes fractown.in as production
2. **Secure CORS**: Only allows requests from your domain in production  
3. **Environment Isolation**: Development and production data remain separate
4. **Professional Branding**: No more `.replit.app` in your production URL

Once you complete the DNS setup in your domain registrar, your fractional real estate platform will be live at `https://fractown.in`!