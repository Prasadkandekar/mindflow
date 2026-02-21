# Gemini API Rate Limits Guide

## Understanding the Error

**Error Code**: 429 - RESOURCE_EXHAUSTED
**Message**: "Quota exceeded for quota metric 'Generate Content API requests per minute'"

This means you've hit the free tier rate limit.

## Free Tier Limits

Google Gemini API free tier has these limits:

- ⏱️ **15 requests per minute** (RPM)
- 📅 **1,500 requests per day** (RPD)
- 📆 **1,000,000 requests per month**

The most common limit you'll hit is the **15 requests per minute**.

## How the App Handles It

### Built-in Rate Limiting ✅

The chat app now includes:

1. **Automatic throttling**: Enforces 4-second minimum between messages
2. **Warning alerts**: Shows friendly message if you try to send too fast
3. **Visual indicator**: Red warning banner when rate limit is hit
4. **Better error handling**: Specific messages for rate limit errors

### What You'll See

**If you send too fast:**
```
⚠️ Please Wait
To avoid rate limits, please wait X seconds before sending another message.
```

**If you hit the limit:**
```
⚠️ Rate Limit Reached
You've reached the free tier limit (15 requests per minute). 
Please wait a minute before sending more messages.

Tip: Wait at least 4 seconds between messages to avoid this.
```

## Best Practices

### 1. Wait Between Messages
- **Minimum**: 4 seconds between messages
- **Recommended**: 5-6 seconds for safety margin
- **Why**: 15 req/min = 1 request every 4 seconds

### 2. Avoid Rapid Testing
When testing the app:
- Don't spam the send button
- Wait for AI response before sending next message
- Clear chat and restart if needed

### 3. Monitor Your Usage
- Free tier resets every minute
- If you hit the limit, wait 60 seconds
- Daily limit is generous (1,500 requests)

## Solutions

### Solution 1: Wait It Out (Free)
**Best for**: Personal use, testing
**How**: 
- Wait 60 seconds after hitting limit
- Continue using normally
- Follow 4-second rule between messages

### Solution 2: Get Your Own API Key (Free)
**Best for**: Multiple users, development
**How**:
1. Go to https://aistudio.google.com/app/apikey
2. Create a new API key
3. Update `.env` with your key
4. Each key gets its own quota

### Solution 3: Upgrade to Paid Tier
**Best for**: Production, high volume
**Cost**: Pay-as-you-go (very affordable)
**Benefits**:
- Higher rate limits
- More requests per minute
- Better for production apps

**Pricing**: Check https://ai.google.dev/pricing

## Troubleshooting

### Issue: Keep hitting rate limit
**Cause**: Sending messages too quickly
**Solution**: 
- Wait at least 4 seconds between messages
- The app now enforces this automatically

### Issue: Rate limit even with delays
**Cause**: Multiple users sharing same API key
**Solution**: 
- Get your own API key
- Each key has separate quota

### Issue: Daily limit reached
**Cause**: Sent 1,500+ messages in 24 hours
**Solution**:
- Wait until next day (resets at midnight UTC)
- Or upgrade to paid tier

## Rate Limit Math

### Free Tier Breakdown

**Per Minute:**
- 15 requests allowed
- 60 seconds ÷ 15 requests = 4 seconds per request
- **Safe rate**: 1 message every 4-5 seconds

**Per Day:**
- 1,500 requests allowed
- If you send 1 message every 4 seconds continuously:
  - 15 messages/minute × 60 minutes = 900 messages/hour
  - 900 messages/hour × 1.67 hours = 1,500 messages
- **Realistic usage**: 100-200 messages per day

**Per Month:**
- 1,000,000 requests allowed
- More than enough for personal use
- ~33,333 requests per day average

## Monitoring Usage

### Check Your Quota
1. Go to https://aistudio.google.com
2. Click on your API key
3. View usage statistics
4. See remaining quota

### Usage Patterns
- **Light use**: 10-20 messages/day = No issues
- **Moderate use**: 50-100 messages/day = No issues
- **Heavy use**: 200+ messages/day = Watch daily limit
- **Testing**: Can hit minute limit quickly

## API Key Best Practices

### 1. Use Your Own Key
- Don't share API keys
- Each developer should have their own
- Easier to track usage

### 2. Rotate Keys
- Create new keys periodically
- Delete old/compromised keys
- Keep keys secure

### 3. Set Restrictions
In Google Cloud Console:
- Restrict to specific APIs
- Add IP restrictions (optional)
- Monitor usage regularly

## Error Codes Reference

| Code | Meaning | Solution |
|------|---------|----------|
| 429 | Rate limit exceeded | Wait 60 seconds |
| 400 | Bad request | Check message format |
| 401 | Invalid API key | Check `.env` file |
| 403 | API not enabled | Enable in Cloud Console |
| 500 | Server error | Try again later |

## Tips for Developers

### During Development
```javascript
// Add delays in testing
await new Promise(resolve => setTimeout(resolve, 4000));
```

### For Production
- Implement request queuing
- Add exponential backoff
- Cache common responses
- Use batch requests when possible

### Testing Strategy
1. Test with delays between requests
2. Don't test rapid-fire scenarios
3. Use mock responses for UI testing
4. Save API calls for integration tests

## Getting Help

### If You're Still Having Issues

1. **Check current usage**:
   - Visit https://aistudio.google.com
   - Review API key usage

2. **Verify rate limiting is working**:
   - App should prevent rapid sends
   - Should show warning messages

3. **Consider upgrading**:
   - If you need higher limits
   - Very affordable for most use cases

4. **Alternative solutions**:
   - Use different API key for testing
   - Implement message queuing
   - Add caching layer

## Summary

✅ **App now includes**:
- Automatic 4-second throttling
- Rate limit detection
- User-friendly error messages
- Visual warning indicators

✅ **Best practices**:
- Wait 4-5 seconds between messages
- Don't spam the send button
- Monitor your usage
- Get your own API key if needed

✅ **Free tier is generous**:
- 15 requests/minute
- 1,500 requests/day
- 1M requests/month
- Perfect for personal use

---

**Remember**: The rate limits are there to ensure fair usage. With the built-in throttling, you should rarely hit them during normal use!
