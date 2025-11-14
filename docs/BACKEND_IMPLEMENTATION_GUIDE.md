# Backend Implementation Guide (Future Enhancement)

## Overview

This guide outlines how to implement a backend API for centralized usage tracking and user-based rate limiting. This is **optional** and should be implemented when scaling beyond the free tier.

## When to Implement Backend

Consider implementing a backend when:

- ✅ User base exceeds 100 active daily users
- ✅ Need cross-device usage tracking
- ✅ Want to prevent localStorage circumvention
- ✅ Ready to invest in infrastructure costs
- ✅ Planning premium tiers or monetization
- ✅ Need analytics and monitoring

## Architecture

```
┌─────────────┐     ┌──────────────┐     ┌──────────────┐     ┌────────────┐
│   Canva     │────▶│  Frontend    │────▶│   Backend    │────▶│  Database  │
│   User      │     │   (React)    │     │  (Node.js)   │     │ (Postgres) │
└─────────────┘     └──────────────┘     └──────────────┘     └────────────┘
                            │                     │
                            │                     ▼
                            │            ┌──────────────┐
                            │            │  MyMemory    │
                            └───────────▶│     API      │
                                        └──────────────┘
```

## Tech Stack Recommendation

### Backend

- **Runtime:** Node.js 20+ (TypeScript)
- **Framework:** Express.js or Fastify
- **Database:** PostgreSQL 14+
- **Cache:** Redis (optional, for rate limiting)
- **Deployment:** Vercel, Railway, or AWS

### Frontend Changes

- Add API client for backend communication
- Implement user token retrieval
- Fallback to localStorage if backend unavailable

## Database Schema

```sql
-- Users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  user_hash VARCHAR(64) UNIQUE NOT NULL,  -- Hashed Canva user token
  created_at TIMESTAMP DEFAULT NOW(),
  last_active_at TIMESTAMP DEFAULT NOW(),
  tier VARCHAR(20) DEFAULT 'free',  -- free, premium, enterprise
  INDEX idx_user_hash (user_hash)
);

-- Usage logs table
CREATE TABLE usage_logs (
  id SERIAL PRIMARY KEY,
  user_hash VARCHAR(64) NOT NULL,
  chars_used INT NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (user_hash) REFERENCES users(user_hash),
  INDEX idx_user_date (user_hash, date),
  UNIQUE (user_hash, date)  -- One record per user per day
);

-- Translation requests table (detailed logging)
CREATE TABLE translation_requests (
  id SERIAL PRIMARY KEY,
  user_hash VARCHAR(64) NOT NULL,
  source_lang VARCHAR(10) NOT NULL,
  target_lang VARCHAR(10) NOT NULL,
  char_count INT NOT NULL,
  element_count INT NOT NULL,
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (user_hash) REFERENCES users(user_hash),
  INDEX idx_user_created (user_hash, created_at)
);

-- Rate limiting table (in-memory with Redis is better)
CREATE TABLE rate_limits (
  user_hash VARCHAR(64) PRIMARY KEY,
  tokens_remaining INT DEFAULT 10,
  last_refill TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (user_hash) REFERENCES users(user_hash)
);
```

## API Endpoints

### 1. Authentication

```typescript
POST / api / auth / verify;
```

**Request:**

```json
{
  "canvaUserToken": "jwt_token_from_canva"
}
```

**Response:**

```json
{
  "userHash": "abc123...",
  "tier": "free",
  "success": true
}
```

**Implementation:**

```typescript
import jwt from "jsonwebtoken";
import crypto from "crypto";

async function verifyUser(canvaUserToken: string) {
  // Verify Canva JWT token (get public keys from Canva)
  const decoded = jwt.verify(canvaUserToken, canvaPublicKey);

  // Hash user ID for privacy
  const userHash = crypto
    .createHash("sha256")
    .update(decoded.userId)
    .digest("hex");

  // Create or update user in database
  await db.query(
    `INSERT INTO users (user_hash) 
     VALUES ($1) 
     ON CONFLICT (user_hash) 
     DO UPDATE SET last_active_at = NOW()`,
    [userHash],
  );

  return { userHash, tier: "free" };
}
```

### 2. Check Usage

```typescript
GET /api/usage/:userHash
```

**Response:**

```json
{
  "charsUsed": 15000,
  "charsRemaining": 30000,
  "dailyLimit": 45000,
  "percentUsed": 33.3,
  "canTranslate": true,
  "date": "2025-11-13"
}
```

### 3. Validate Batch

```typescript
POST / api / usage / validate;
```

**Request:**

```json
{
  "userHash": "abc123...",
  "charCount": 5000
}
```

**Response:**

```json
{
  "canProceed": true,
  "charsRemaining": 30000,
  "message": "Ready to translate",
  "estimatedWaitTime": 0
}
```

### 4. Record Usage

```typescript
POST / api / usage / record;
```

**Request:**

```json
{
  "userHash": "abc123...",
  "charCount": 5000,
  "elementCount": 10,
  "sourceLang": "es",
  "targetLang": "en"
}
```

**Response:**

```json
{
  "success": true,
  "charsUsed": 20000,
  "charsRemaining": 25000
}
```

### 5. Translation Proxy (Optional)

```typescript
POST / api / translate;
```

**Request:**

```json
{
  "userHash": "abc123...",
  "text": "Hola mundo",
  "sourceLang": "es",
  "targetLang": "en"
}
```

**Response:**

```json
{
  "translatedText": "Hello world",
  "charsUsed": 10,
  "success": true
}
```

**Benefits of Proxy:**

- Centralized API key management
- Better rate limiting control
- Can implement caching
- Detailed logging
- Easier to switch translation providers

## Rate Limiting Implementation

### Using Redis (Recommended)

```typescript
import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL);

class TokenBucketRateLimiter {
  private capacity = 10;
  private refillRate = 2; // tokens per second

  async consume(userHash: string, tokens: number = 1): Promise<boolean> {
    const key = `rate_limit:${userHash}`;

    // Get current state
    const state = await redis.get(key);
    let { tokens: available, lastRefill } = state
      ? JSON.parse(state)
      : { tokens: this.capacity, lastRefill: Date.now() };

    // Refill tokens based on time elapsed
    const now = Date.now();
    const elapsed = (now - lastRefill) / 1000;
    available = Math.min(this.capacity, available + elapsed * this.refillRate);

    // Try to consume
    if (available >= tokens) {
      available -= tokens;
      await redis.setex(
        key,
        86400, // 24 hour TTL
        JSON.stringify({ tokens: available, lastRefill: now }),
      );
      return true;
    }

    return false;
  }
}
```

## Frontend Integration

### 1. Add User Token Retrieval

```typescript
// src/services/auth.ts
import { auth } from "@canva/user";

export async function getUserToken(): Promise<string | null> {
  try {
    const token = await auth.getCanvaUserToken();
    return token;
  } catch (error) {
    console.error("Failed to get user token:", error);
    return null;
  }
}
```

### 2. Create API Client

```typescript
// src/services/api_client.ts
const API_BASE_URL = process.env.BACKEND_URL || "https://api.ctranslator.app";

export class APIClient {
  private userHash: string | null = null;

  async authenticate(): Promise<boolean> {
    const token = await getUserToken();
    if (!token) return false;

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ canvaUserToken: token }),
      });

      const data = await response.json();
      this.userHash = data.userHash;
      return true;
    } catch (error) {
      console.error("Authentication failed:", error);
      return false;
    }
  }

  async checkUsage(): Promise<UsageStats> {
    const response = await fetch(`${API_BASE_URL}/api/usage/${this.userHash}`);
    return response.json();
  }

  async recordUsage(charCount: number, elementCount: number): Promise<void> {
    await fetch(`${API_BASE_URL}/api/usage/record`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userHash: this.userHash,
        charCount,
        elementCount,
      }),
    });
  }
}
```

### 3. Update Usage Tracker

```typescript
// src/utils/usage_tracker_backend.ts
import { APIClient } from "../services/api_client";

export class BackendUsageTracker extends UsageTracker {
  private apiClient: APIClient;

  constructor() {
    super("backend");
    this.apiClient = new APIClient();
  }

  async initialize(): Promise<boolean> {
    return await this.apiClient.authenticate();
  }

  async getUsageStats(): Promise<UsageStats> {
    try {
      return await this.apiClient.checkUsage();
    } catch (error) {
      // Fallback to localStorage
      return super.getUsageStats();
    }
  }

  async recordUsage(charCount: number): Promise<void> {
    try {
      await this.apiClient.recordUsage(charCount, 1);
    } catch (error) {
      // Fallback to localStorage
      super.recordUsage(charCount);
    }
  }
}
```

## Deployment

### Option 1: Vercel (Recommended for Node.js)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Set environment variables
vercel env add DATABASE_URL
vercel env add REDIS_URL
vercel env add CANVA_PUBLIC_KEY
```

### Option 2: Railway

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login and initialize
railway login
railway init

# Deploy
railway up
```

### Option 3: AWS (EC2 + RDS)

1. Set up RDS PostgreSQL instance
2. Launch EC2 instance
3. Deploy Node.js app
4. Configure security groups
5. Set up CloudWatch monitoring

## Security Considerations

### 1. Token Validation

```typescript
// Validate Canva JWT tokens using their public keys
import jwksClient from "jwks-rsa";

const client = jwksClient({
  jwksUri: "https://api.canva.com/rest/v1/oauth/jwks",
});

function getKey(header, callback) {
  client.getSigningKey(header.kid, (err, key) => {
    const signingKey = key.getPublicKey();
    callback(null, signingKey);
  });
}

jwt.verify(token, getKey, options, (err, decoded) => {
  // Token is valid
});
```

### 2. Rate Limiting

- Implement per-IP rate limiting
- Limit failed authentication attempts
- Use CAPTCHA for suspicious activity

### 3. Data Privacy

- Hash all user identifiers
- Encrypt sensitive data at rest
- Implement GDPR compliance (right to deletion)
- Log retention policies

### 4. API Security

- Use HTTPS only
- Implement CORS properly
- Validate all inputs
- Use prepared statements (prevent SQL injection)
- Implement request signing

## Monitoring & Analytics

### Metrics to Track

1. **Usage Metrics:**
   - Total translations per day
   - Character usage per user
   - Average chars per translation
   - Peak usage times

2. **Performance Metrics:**
   - API response times
   - Database query performance
   - MyMemory API latency
   - Error rates

3. **User Metrics:**
   - Daily active users
   - User retention
   - Feature adoption
   - Tier distribution

### Tools

- **Logging:** Winston, Pino
- **Monitoring:** Datadog, New Relic, Sentry
- **Analytics:** Mixpanel, Amplitude
- **Alerts:** PagerDuty, Opsgenie

## Cost Estimation

### Infrastructure

| Service         | Provider         | Monthly Cost |
| --------------- | ---------------- | ------------ |
| Backend Hosting | Vercel Pro       | $20          |
| Database        | Railway Postgres | $10          |
| Redis Cache     | Upstash          | $10          |
| Monitoring      | Sentry           | $26          |
| **Total**       |                  | **$66/mo**   |

### Scaling Costs

- **100 users:** ~$66/mo
- **1,000 users:** ~$150/mo (need bigger database)
- **10,000 users:** ~$500/mo (need load balancing, CDN)

## Testing

### Unit Tests

```typescript
describe("TokenBucketRateLimiter", () => {
  it("should allow requests within capacity", async () => {
    const limiter = new TokenBucketRateLimiter();
    expect(await limiter.consume("user1", 1)).toBe(true);
  });

  it("should reject requests exceeding capacity", async () => {
    const limiter = new TokenBucketRateLimiter();
    // Consume all tokens
    for (let i = 0; i < 10; i++) {
      await limiter.consume("user1", 1);
    }
    expect(await limiter.consume("user1", 1)).toBe(false);
  });
});
```

### Integration Tests

```typescript
describe("API Endpoints", () => {
  it("should record usage correctly", async () => {
    const response = await request(app).post("/api/usage/record").send({
      userHash: "test123",
      charCount: 1000,
      elementCount: 5,
    });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });
});
```

## Migration Strategy

### Phase 1: Parallel Running (Week 1-2)

- Deploy backend
- Frontend calls both localStorage AND backend
- Compare results, fix discrepancies

### Phase 2: Soft Launch (Week 3-4)

- 10% of users use backend tracking
- Monitor for issues
- Gradually increase to 50%

### Phase 3: Full Migration (Week 5-6)

- All users on backend tracking
- localStorage as fallback only
- Monitor performance

### Phase 4: Deprecation (Week 7+)

- Remove localStorage tracking code
- Backend only
- Celebrate! 🎉

## Support & Maintenance

### Regular Tasks

- **Daily:** Monitor error rates, API usage
- **Weekly:** Review user feedback, optimize queries
- **Monthly:** Database backups, security updates
- **Quarterly:** Cost analysis, scaling planning

### Emergency Procedures

1. **API Down:** Automatic fallback to localStorage
2. **Database Down:** Read from cache, queue writes
3. **High Load:** Enable rate limiting, scale horizontally

## Conclusion

This backend implementation provides:

✅ **Scalability** - Handle thousands of users
✅ **Reliability** - Centralized tracking
✅ **Security** - Protected user data
✅ **Monetization** - Support premium tiers
✅ **Analytics** - Detailed insights

**When to start:** When you have 100+ daily active users or need to prevent quota abuse.
