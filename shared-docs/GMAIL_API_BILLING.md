# Gmail API Billing & Costs

## Quick Answer

**OAuth consent screen configuration is FREE** - it's just a security setting.

**Gmail API usage costs depend on quotas:**
- ✅ **Free tier**: 1 billion quota units per day (shared across all users)
- ✅ **Per-user quotas**: 250 quota units per user per second
- ⚠️ **Costs**: Only if you exceed free tier (very unlikely for most apps)

## Important: Who Pays?

**YOU (the platform owner) pay for API usage**, not your users.

- All API calls count against **YOUR Google Cloud project quota**
- Users connecting their Gmail accounts don't pay anything
- Costs are on your Google Cloud billing account
- This is standard for OAuth-based integrations

## Gmail API Quota Units

### What Counts as Quota Units?

| Operation | Quota Units |
|-----------|-------------|
| Send email | 100 units |
| Read message | 5 units |
| List messages | 5 units |
| Get message | 5 units |
| Modify message | 5 units |

### Free Tier Limits

- **Daily quota**: 1,000,000,000 quota units/day (1 billion)
- **Per-user limit**: 250 quota units/second
- **This is shared across ALL your users**

### Example Usage

**Scenario**: 100 users, each sending 10 emails/day
- 100 users × 10 emails × 100 units = 100,000 units/day
- **Well within free tier** (1 billion units available)

**Scenario**: 1,000 users, each sending 100 emails/day
- 1,000 users × 100 emails × 100 units = 10,000,000 units/day
- **Still well within free tier**

## When Do You Pay?

### You Only Pay If:

1. **Exceed 1 billion quota units/day** (extremely unlikely)
2. **Enable paid APIs** (Gmail API is free, but some Google APIs cost money)
3. **Use other Google Cloud services** (Compute, Storage, etc.)

### You DON'T Pay For:

- ✅ OAuth consent screen configuration
- ✅ Users connecting their accounts
- ✅ Gmail API usage within free tier
- ✅ Token storage/management
- ✅ OAuth authentication flow

## Cost Estimation

### Typical CRM Usage

**Small business (10 users)**:
- ~50 emails/day per user
- 10 × 50 × 100 = 50,000 units/day
- **Cost: $0** (0.005% of free tier)

**Medium business (100 users)**:
- ~100 emails/day per user
- 100 × 100 × 100 = 1,000,000 units/day
- **Cost: $0** (0.1% of free tier)

**Large business (1,000 users)**:
- ~200 emails/day per user
- 1,000 × 200 × 100 = 20,000,000 units/day
- **Cost: $0** (2% of free tier)

### If You Exceed Free Tier

- **Rare**: Would need 10,000+ users sending 1,000+ emails/day each
- **Cost**: Contact Google for enterprise pricing
- **Solution**: Request quota increase (usually free for legitimate use)

## Monitoring Usage

### Check Your Usage

1. Go to Google Cloud Console
2. Navigate to **APIs & Services** > **Dashboard**
3. Select **Gmail API**
4. View **Quotas** tab to see current usage

### Set Up Alerts

1. Go to **IAM & Admin** > **Quotas**
2. Find Gmail API quotas
3. Set up alerts at 50%, 75%, 90% of quota
4. Get notified before hitting limits

## Best Practices

### 1. Monitor Usage
- Check quota usage monthly
- Set up alerts for high usage
- Track per-user email volume

### 2. Optimize API Calls
- Batch operations when possible
- Cache message lists
- Use webhooks instead of polling (if available)

### 3. Rate Limiting
- Implement rate limiting in your app
- Respect per-user quotas (250 units/second)
- Queue emails if needed

### 4. Cost Control
- Monitor daily quota usage
- Set per-account email limits (optional)
- Alert on unusual spikes

## OAuth Consent Screen: Free

**Important**: The OAuth consent screen configuration is completely free:
- Setting user type (Internal/External): **FREE**
- Adding test users: **FREE**
- App verification: **FREE**
- Publishing app: **FREE**

These are just security/access control settings, not billable services.

## Summary

| Item | Cost |
|------|------|
| OAuth consent screen setup | **FREE** |
| Users connecting accounts | **FREE** |
| Gmail API (within free tier) | **FREE** |
| Gmail API (exceeding free tier) | **Contact Google** |
| Token storage in your DB | **Your DB costs** |

## Recommendation

For a CRM platform:
- ✅ **Start with free tier** - it's more than enough
- ✅ **Monitor usage** - set up alerts
- ✅ **Optimize calls** - batch when possible
- ✅ **Don't worry** - free tier covers 99.9% of use cases

You'll likely never hit the free tier limit unless you have thousands of users sending thousands of emails per day.

## Questions?

- **"Will I be charged for users connecting?"** → No, OAuth is free
- **"Will I be charged for emails sent?"** → No, within free tier (1B units/day)
- **"When will I be charged?"** → Only if you exceed 1B quota units/day (extremely rare)
- **"Can I limit costs?"** → Yes, monitor usage and set alerts

## Next Steps

1. ✅ Set up OAuth consent screen (free)
2. ✅ Configure Gmail API (free)
3. ✅ Monitor quota usage (free dashboard)
4. ✅ Set up alerts (free)
5. ⏳ Only pay if you exceed free tier (unlikely)

