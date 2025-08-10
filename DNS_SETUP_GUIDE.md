# DNS Setup Guide for fractown.in

## Step-by-Step DNS Configuration

After you deploy your app in Replit, you'll need to configure DNS records in your domain registrar to point fractown.in to your Replit deployment.

## Phase 1: Deploy Your App First

1. **Deploy in Replit**
   - Click the "Deploy" button in your Replit project
   - Wait for deployment to complete
   - Note the temporary URL (e.g., `your-app-name.replit.app`)

## Phase 2: Get DNS Records from Replit

1. **Navigate to Deployments**
   - Go to your Replit project
   - Click on the "Deployments" tab
   - Select your active deployment

2. **Access Domain Settings**
   - Click on the "Settings" tab within Deployments
   - Look for "Custom Domain" or "Link a domain" section
   - Click "Link a domain" or "Add custom domain"

3. **Enter Your Domain**
   - Enter: `fractown.in`
   - Click "Continue" or "Next"

4. **Get DNS Records**
   Replit will provide you with specific DNS records like:
   ```
   A Record:
   Name: @ (or leave blank)
   Value: 123.456.789.101 (example IP)
   
   TXT Record:
   Name: @ (or leave blank) 
   Value: replit-verify=abc123def456 (example verification code)
   ```

## Phase 3: Configure DNS in Your Domain Registrar

### For Popular Registrars:

#### GoDaddy
1. Login to GoDaddy account
2. Go to "My Products" → "DNS"
3. Find fractown.in and click "Manage"
4. Add the A Record:
   - Type: A
   - Name: @ (or leave blank for root domain)
   - Value: [IP address from Replit]
   - TTL: 1 Hour (default)
5. Add the TXT Record:
   - Type: TXT
   - Name: @ (or leave blank)
   - Value: [Verification code from Replit]
   - TTL: 1 Hour

#### Namecheap
1. Login to Namecheap account
2. Go to "Domain List" → Manage fractown.in
3. Click "Advanced DNS"
4. Add A Record:
   - Type: A Record
   - Host: @
   - Value: [IP address from Replit]
   - TTL: Automatic
5. Add TXT Record:
   - Type: TXT Record
   - Host: @
   - Value: [Verification code from Replit]
   - TTL: Automatic

#### Cloudflare
1. Login to Cloudflare dashboard
2. Select fractown.in domain
3. Go to "DNS" → "Records"
4. Add A Record:
   - Type: A
   - Name: @
   - IPv4 address: [IP from Replit]
   - Proxy status: DNS only (gray cloud)
5. Add TXT Record:
   - Type: TXT
   - Name: @
   - Content: [Verification code from Replit]

#### Google Domains
1. Login to Google Domains
2. Select fractown.in
3. Go to "DNS" tab
4. Scroll to "Custom resource records"
5. Add A Record:
   - Name: @ (leave blank)
   - Type: A
   - TTL: 1H
   - Data: [IP address from Replit]
6. Add TXT Record:
   - Name: @ (leave blank)
   - Type: TXT
   - TTL: 1H
   - Data: [Verification code from Replit]

## Phase 4: Verification and Propagation

### DNS Propagation
- **Time**: 5 minutes to 48 hours (usually 15-30 minutes)
- **Check Status**: Use online tools like `whatsmydns.net`
- **Test Command**: `nslookup fractown.in`

### Verification Process
1. **Replit Verification**
   - Return to Replit Deployments → Settings
   - Click "Verify" or "Check DNS"
   - Replit will confirm when records are detected

2. **Manual Testing**
   ```bash
   # Test if A record is working
   nslookup fractown.in
   
   # Test if TXT record is working  
   nslookup -type=TXT fractown.in
   ```

### Success Indicators
- ✅ `fractown.in` resolves to Replit's IP address
- ✅ TXT verification record is found
- ✅ Replit shows "Domain verified" status
- ✅ `https://fractown.in` loads your app

## Phase 5: Optional Subdomain Setup

### WWW Subdomain (www.fractown.in)
Add a CNAME record:
- Type: CNAME
- Name: www
- Value: fractown.in
- TTL: 1 Hour

### API Subdomain (api.fractown.in)
Add a CNAME record:
- Type: CNAME  
- Name: api
- Value: fractown.in
- TTL: 1 Hour

## Troubleshooting

### Common Issues

#### DNS Not Propagating
- **Wait**: DNS can take up to 48 hours
- **Clear Cache**: Clear browser DNS cache
- **Use Different DNS**: Try 8.8.8.8 (Google DNS)

#### Wrong IP Address
- **Check Records**: Verify A record points to correct Replit IP
- **Update Records**: Use the exact IP provided by Replit
- **Delete Old Records**: Remove any conflicting A records

#### Verification Failing
- **TXT Record**: Ensure TXT record is exactly as provided by Replit
- **Root Domain**: Make sure using @ or blank name, not "fractown.in"
- **Quotes**: Don't add extra quotes around TXT value

#### HTTPS Issues
- **Certificate**: Replit automatically provides SSL certificate
- **Force HTTPS**: May take a few minutes after domain verification
- **Mixed Content**: Ensure all resources use HTTPS

## Quick Reference

### Required DNS Records
```
A Record:
Name: @
Value: [IP from Replit]

TXT Record:  
Name: @
Value: [Verification code from Replit]
```

### Testing Commands
```bash
# Check A record
nslookup fractown.in

# Check TXT record
nslookup -type=TXT fractown.in

# Test website
curl -I https://fractown.in
```

### Support Resources
- **Replit Docs**: docs.replit.com
- **Domain Registrar Support**: Contact your registrar's support
- **DNS Checker**: whatsmydns.net
- **SSL Checker**: ssllabs.com/ssltest

Once DNS propagation is complete, your fractional real estate platform will be live at `https://fractown.in`!