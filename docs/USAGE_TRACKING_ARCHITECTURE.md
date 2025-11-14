# Usage Tracking Architecture

## Overview

This document outlines the usage tracking system for Ctranslator, designed to manage MyMemory API limits while preparing for future scaling.

## Current Implementation (v2 - User-Based Tracking)

**Status:** ✅ Active (Phase 2)

### Primary Mode: User-Based Tracking

**How it works:**

- Retrieves Canva user token via `auth.getCanvaUserToken()`
- Hashes token for privacy (SHA-256)
- Stores usage keyed by user hash in localStorage
- Syncs across browsers/devices for same user

**Fallback Mode:** If user auth unavailable, falls back to browser-only localStorage

### Storage Method (v1 - Now Fallback Only)

- **Browser localStorage** - Per-browser tracking
- **Key:** `ctranslator_usage`
- **Reset:** Automatic at midnight UTC
- **Scope:** Device/browser-specific (not user-specific)

### Limitations

- ❌ Not user-specific (different browsers = different limits)
- ❌ Can be cleared by user
- ❌ No cross-device synchronization
- ❌ No centralized monitoring
- ✅ Simple, no backend required
- ✅ Works immediately
- ✅ Privacy-friendly (no user tracking)

### Current Limits

- 45,000 chars/day per browser
- 500 chars per text element
- 50 elements max per batch
- 500ms rate limiting between requests

## Future Implementation (v2 - User-Based)

### Architecture Options

#### Option A: Canva User Token (Frontend-Only)

```typescript
import { auth } from "@canva/user";

// Get user token for identification
const token = await auth.getCanvaUserToken();
const userHash = hashToken(token); // Hash for privacy

// Store usage keyed by user hash
localStorage.setItem(`ctranslator_usage_${userHash}`, usageData);
```

**Pros:**

- No backend required
- User-specific limits
- Works across devices (same user = same token)

**Cons:**

- Still uses localStorage (can be cleared)
- Token must be retrieved on each session
- Limited monitoring capabilities

#### Option B: Backend API (Full Solution)

```
User → Canva App → Backend API → Database
                     ↓
              Usage Tracking Service
                     ↓
              MyMemory API Proxy
```

**Backend Responsibilities:**

1. User authentication via Canva user token
2. Centralized usage tracking in database
3. Rate limiting enforcement
4. MyMemory API proxy with quota management
5. Analytics and monitoring

**Database Schema:**

```sql
CREATE TABLE usage_logs (
  id SERIAL PRIMARY KEY,
  user_hash VARCHAR(64) NOT NULL,  -- Hashed Canva user token
  chars_used INT NOT NULL,
  request_count INT NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  INDEX idx_user_date (user_hash, date)
);

CREATE TABLE rate_limits (
  user_hash VARCHAR(64) PRIMARY KEY,
  last_request_at TIMESTAMP,
  tokens_remaining INT,
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Pros:**

- ✅ True user-based tracking
- ✅ Cross-device synchronization
- ✅ Cannot be circumvented by clearing localStorage
- ✅ Centralized monitoring and analytics
- ✅ Can implement premium tiers
- ✅ Better rate limiting (token bucket algorithm)

**Cons:**

- ❌ Requires backend infrastructure
- ❌ Additional hosting costs
- ❌ More complex deployment
- ❌ Privacy considerations (storing user data)

## Rate Limiting Strategies

### Current: Simple Delay (v1)

```typescript
// 500ms delay between requests
await new Promise((resolve) => setTimeout(resolve, 500));
```

**Pros:** Simple, works immediately
**Cons:** Not sophisticated, doesn't handle bursts well

### Recommended: Token Bucket Algorithm (v2)

```typescript
class TokenBucket {
  private tokens: number;
  private lastRefill: number;
  private readonly capacity: number;
  private readonly refillRate: number; // tokens per second

  constructor(capacity: number, refillRate: number) {
    this.capacity = capacity;
    this.refillRate = refillRate;
    this.tokens = capacity;
    this.lastRefill = Date.now();
  }

  async consume(tokens: number = 1): Promise<boolean> {
    this.refill();

    if (this.tokens >= tokens) {
      this.tokens -= tokens;
      return true;
    }

    // Calculate wait time
    const tokensNeeded = tokens - this.tokens;
    const waitMs = (tokensNeeded / this.refillRate) * 1000;

    await new Promise((resolve) => setTimeout(resolve, waitMs));
    this.tokens -= tokens;
    return true;
  }

  private refill(): void {
    const now = Date.now();
    const timePassed = (now - this.lastRefill) / 1000; // seconds
    const tokensToAdd = timePassed * this.refillRate;

    this.tokens = Math.min(this.capacity, this.tokens + tokensToAdd);
    this.lastRefill = now;
  }
}

// Usage
const bucket = new TokenBucket(10, 2); // 10 capacity, 2 tokens/sec
await bucket.consume(1); // Waits if needed
```

**Pros:**

- Handles bursts gracefully
- More efficient API usage
- Industry-standard approach

## Canva SDK User Authentication

### Available Methods

```typescript
import { auth } from "@canva/user";

// Get user token (requires backend)
const token = await auth.getCanvaUserToken();
// Returns: JWT token representing current user
// Use case: Authenticate with your backend

// Note: Token is intended for backend authentication
// Frontend should send this to backend for verification
```

### Required Scopes

Add to `canva-app.json`:

```json
{
  "runtime": {
    "permissions": [
      {
        "name": "canva:user:read",
        "type": "mandatory"
      }
    ]
  }
}
```

### Privacy & Security

**Best Practices:**

1. **Hash tokens** before storing anywhere
2. **Never store raw tokens** in localStorage
3. **Use HTTPS** for all backend communication
4. **Implement token rotation** on backend
5. **Follow GDPR/privacy regulations**
6. **Allow users to view/delete their data**

## Migration Path

### Phase 1: Basic Tracking (Completed ✅)

- localStorage-based tracking
- Simple per-browser limits
- Basic rate limiting

### Phase 2: User-Based Tracking (Completed ✅)

1. Implement token bucket rate limiting
2. Add user token hashing for better tracking
3. Improve error handling and UX
4. Add usage analytics dashboard

### Phase 3: Backend Infrastructure (Future)

1. Set up backend API (Node.js/Express)
2. Implement database (PostgreSQL)
3. Create usage tracking service
4. Deploy MyMemory API proxy
5. Add monitoring and alerting

### Phase 4: Scale & Monetize (Long-term)

1. Apply for MyMemory whitelisting (150k chars/day)
2. Implement premium tiers
3. Add payment integration
4. Advanced analytics
5. Multi-language support

## Comparison: Storage Solutions

| Feature          | localStorage (v1) | User Token (v2a) | Backend API (v2b) |
| ---------------- | ----------------- | ---------------- | ----------------- |
| Backend Required | ❌ No             | ❌ No            | ✅ Yes            |
| User-Specific    | ❌ No             | ⚠️ Limited       | ✅ Yes            |
| Cross-Device     | ❌ No             | ⚠️ Limited       | ✅ Yes            |
| Can't Circumvent | ❌ No             | ❌ No            | ✅ Yes            |
| Monitoring       | ❌ No             | ❌ No            | ✅ Yes            |
| Cost             | Free              | Free             | $-$$              |
| Complexity       | Low               | Medium           | High              |
| Privacy          | High              | Medium           | Low               |
| Scalability      | Low               | Medium           | High              |

## Recommendations

### For MVP / Early Stage (Current)

✅ **Use localStorage tracking** (implemented)

- Simple, fast to deploy
- No infrastructure costs
- Good enough for initial users
- Focus on product validation

### For Growth Stage (3-6 months)

🎯 **Implement user token tracking**

- Better user experience
- Prepare for scaling
- Still no backend costs
- Gradual migration path

### For Scale Stage (6-12 months)

🚀 **Build backend infrastructure**

- True user tracking
- Premium tiers
- Better monitoring
- Professional service

## External API Best Practices

Based on research of other Canva apps:

1. **Always implement rate limiting**
   - Protect your quotas
   - Better user experience
   - Prevent abuse

2. **Provide clear feedback**
   - Show usage to users
   - Warn before limits
   - Suggest alternatives

3. **Cache when possible**
   - Store translations locally
   - Reuse previous work
   - Reduce API calls

4. **Graceful degradation**
   - Handle errors well
   - Provide fallbacks
   - Never block users completely

5. **Monitor and alert**
   - Track API usage
   - Set up alerts
   - Plan for growth

## References

- [Canva Apps SDK - Authenticating Users](https://www.canva.dev/docs/apps/authenticating-users/)
- [Canva Apps SDK - Security Guidelines](https://www.canva.dev/docs/apps/security-guidelines/)
- [MyMemory API Documentation](https://mymemory.translated.net/doc/)
- [Token Bucket Algorithm](https://en.wikipedia.org/wiki/Token_bucket)
- [Rate Limiting Strategies](https://cloud.google.com/architecture/rate-limiting-strategies-techniques)
