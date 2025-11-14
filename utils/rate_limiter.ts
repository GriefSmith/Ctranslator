/**
 * Token Bucket Rate Limiter
 * Implements industry-standard token bucket algorithm for API rate limiting
 * 
 * Benefits over simple delays:
 * - Allows bursts of requests when tokens are available
 * - Smoother API usage over time
 * - More efficient than fixed delays
 * - Industry standard (used by AWS, Google Cloud, etc.)
 */

export class TokenBucket {
  private tokens: number;
  private lastRefill: number;
  private readonly capacity: number;
  private readonly refillRate: number; // tokens per second

  /**
   * Create a new token bucket
   * @param capacity Maximum number of tokens (burst size)
   * @param refillRate Tokens added per second (sustained rate)
   */
  constructor(capacity: number, refillRate: number) {
    this.capacity = capacity;
    this.refillRate = refillRate;
    this.tokens = capacity; // Start with full bucket
    this.lastRefill = Date.now();
  }

  /**
   * Attempt to consume tokens. Waits if not enough tokens available.
   * @param tokensNeeded Number of tokens to consume (default: 1)
   * @returns Promise that resolves when tokens are consumed
   */
  async consume(tokensNeeded: number = 1): Promise<void> {
    this.refill();

    // If we have enough tokens, consume immediately
    if (this.tokens >= tokensNeeded) {
      this.tokens -= tokensNeeded;
      return;
    }

    // Calculate how long to wait for enough tokens
    const tokensShort = tokensNeeded - this.tokens;
    const waitMs = (tokensShort / this.refillRate) * 1000;

    await new Promise((resolve) => setTimeout(resolve, waitMs));

    // Refill again after waiting and consume
    this.refill();
    this.tokens = Math.max(0, this.tokens - tokensNeeded);
  }

  /**
   * Check if tokens are available without consuming
   * @param tokensNeeded Number of tokens to check
   * @returns True if enough tokens are available
   */
  canConsume(tokensNeeded: number = 1): boolean {
    this.refill();
    return this.tokens >= tokensNeeded;
  }

  /**
   * Get current token count
   * @returns Number of tokens currently available
   */
  getAvailableTokens(): number {
    this.refill();
    return Math.floor(this.tokens);
  }

  /**
   * Calculate wait time for tokens
   * @param tokensNeeded Number of tokens needed
   * @returns Wait time in milliseconds
   */
  getWaitTime(tokensNeeded: number = 1): number {
    this.refill();

    if (this.tokens >= tokensNeeded) {
      return 0;
    }

    const tokensShort = tokensNeeded - this.tokens;
    return Math.ceil((tokensShort / this.refillRate) * 1000);
  }

  /**
   * Refill tokens based on time elapsed
   * Called automatically by other methods
   */
  private refill(): void {
    const now = Date.now();
    const timePassed = (now - this.lastRefill) / 1000; // Convert to seconds
    const tokensToAdd = timePassed * this.refillRate;

    this.tokens = Math.min(this.capacity, this.tokens + tokensToAdd);
    this.lastRefill = now;
  }

  /**
   * Reset the bucket to full capacity
   * Useful for testing or manual resets
   */
  reset(): void {
    this.tokens = this.capacity;
    this.lastRefill = Date.now();
  }
}

/**
 * Create a rate limiter optimized for MyMemory API
 * 
 * MyMemory limits (observed):
 * - ~100 requests per minute
 * - Daily character limits (managed separately)
 * 
 * Configuration:
 * - Capacity: 10 tokens (allows small bursts)
 * - Refill: 2 tokens/second (120/minute, stays under limit)
 */
export function createMyMemoryRateLimiter(): TokenBucket {
  return new TokenBucket(10, 2); // 10 capacity, 2 tokens per second
}

/**
 * Singleton instance for app-wide rate limiting
 */
let globalRateLimiter: TokenBucket | null = null;

/**
 * Get or create the global rate limiter instance
 */
export function getGlobalRateLimiter(): TokenBucket {
  if (!globalRateLimiter) {
    globalRateLimiter = createMyMemoryRateLimiter();
  }
  return globalRateLimiter;
}

/**
 * Reset the global rate limiter (useful for testing)
 */
export function resetGlobalRateLimiter(): void {
  if (globalRateLimiter) {
    globalRateLimiter.reset();
  }
}

