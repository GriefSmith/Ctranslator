/**
 * Enhanced Usage Tracker v2
 * Supports both localStorage and future user-based tracking
 * Integrates with token bucket rate limiter
 * 
 * Migration path:
 * 1. Current: localStorage only (per-browser)
 * 2. Future: User token hashing (per-user, cross-browser)
 * 3. Long-term: Backend API (centralized tracking)
 */

// Configuration
const DAILY_LIMIT_CHARS = 45000; // 45k to stay under 50k limit with buffer
const STORAGE_KEY_PREFIX = "ctranslator_usage";
const WARNING_THRESHOLD = 0.8; // Warn at 80% usage
const CRITICAL_THRESHOLD = 0.95; // Critical warning at 95%

// Usage data structure
interface UsageData {
  date: string; // YYYY-MM-DD format
  charsUsed: number;
  requestCount: number;
  lastUpdated: number; // timestamp
  userIdentifier?: string; // Optional: for future user-based tracking
}

// Tracking mode
type TrackingMode = "localStorage" | "userBased" | "backend";

/**
 * Enhanced Usage Tracker with support for multiple tracking modes
 */
export class UsageTracker {
  private mode: TrackingMode = "localStorage";
  private userIdentifier: string | null = null;

  constructor(mode: TrackingMode = "localStorage") {
    this.mode = mode;
  }

  /**
   * Set user identifier for user-based tracking
   * @param identifier Hashed user token or unique identifier
   */
  setUserIdentifier(identifier: string): void {
    this.userIdentifier = identifier;
    if (this.mode === "localStorage") {
      console.log(
        "[UsageTracker] User identifier set. Consider switching to userBased mode.",
      );
    }
  }

  /**
   * Get storage key based on tracking mode
   */
  private getStorageKey(): string {
    if (this.mode === "userBased" && this.userIdentifier) {
      return `${STORAGE_KEY_PREFIX}_${this.userIdentifier}`;
    }
    return STORAGE_KEY_PREFIX; // Default localStorage key
  }

  /**
   * Get current date in YYYY-MM-DD format (UTC)
   */
  private getCurrentDate(): string {
    const now = new Date();
    return now.toISOString().split("T")[0];
  }

  /**
   * Load usage data from storage
   */
  private loadUsageData(): UsageData {
    try {
      const key = this.getStorageKey();
      const stored = localStorage.getItem(key);

      if (stored) {
        const data: UsageData = JSON.parse(stored);

        // Reset if it's a new day
        if (data.date !== this.getCurrentDate()) {
          return this.createFreshUsageData();
        }

        return data;
      }
    } catch (error) {
      console.error("[UsageTracker] Failed to load usage data:", error);
    }

    return this.createFreshUsageData();
  }

  /**
   * Create fresh usage data object
   */
  private createFreshUsageData(): UsageData {
    return {
      date: this.getCurrentDate(),
      charsUsed: 0,
      requestCount: 0,
      lastUpdated: Date.now(),
      userIdentifier: this.userIdentifier || undefined,
    };
  }

  /**
   * Save usage data to storage
   */
  private saveUsageData(data: UsageData): void {
    try {
      data.lastUpdated = Date.now();
      data.userIdentifier = this.userIdentifier || undefined;
      const key = this.getStorageKey();
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error("[UsageTracker] Failed to save usage data:", error);
    }
  }

  /**
   * Record character usage
   * @param charCount Number of characters used
   */
  recordUsage(charCount: number): void {
    const data = this.loadUsageData();
    data.charsUsed += charCount;
    data.requestCount += 1;
    this.saveUsageData(data);
  }

  /**
   * Check if adding more characters would exceed the daily limit
   * @param charCount Number of characters to check
   * @returns True if usage is within limits
   */
  canUseChars(charCount: number): boolean {
    const data = this.loadUsageData();
    return data.charsUsed + charCount <= DAILY_LIMIT_CHARS;
  }

  /**
   * Get current usage statistics
   */
  getUsageStats(): {
    charsUsed: number;
    charsRemaining: number;
    percentUsed: number;
    requestCount: number;
    dailyLimit: number;
    isNearLimit: boolean;
    isCritical: boolean;
    date: string;
    trackingMode: TrackingMode;
    userIdentifier?: string;
  } {
    const data = this.loadUsageData();
    const percentUsed = (data.charsUsed / DAILY_LIMIT_CHARS) * 100;

    return {
      charsUsed: data.charsUsed,
      charsRemaining: Math.max(0, DAILY_LIMIT_CHARS - data.charsUsed),
      percentUsed: Math.min(100, percentUsed),
      requestCount: data.requestCount,
      dailyLimit: DAILY_LIMIT_CHARS,
      isNearLimit: percentUsed >= WARNING_THRESHOLD * 100,
      isCritical: percentUsed >= CRITICAL_THRESHOLD * 100,
      date: data.date,
      trackingMode: this.mode,
      userIdentifier: data.userIdentifier,
    };
  }

  /**
   * Calculate total character count for texts
   * @param texts Array of text strings
   * @returns Total character count
   */
  calculateCharCount(texts: string[]): number {
    return texts.reduce((total, text) => {
      const cleaned = text.trim();
      return total + cleaned.length;
    }, 0);
  }

  /**
   * Get user-friendly usage message
   */
  getUsageMessage(): {
    message: string;
    tone: "info" | "warning" | "critical";
  } {
    const stats = this.getUsageStats();

    if (stats.isCritical) {
      return {
        message: `⚠️ Critical: ${stats.percentUsed.toFixed(0)}% of daily limit used (${stats.charsRemaining.toLocaleString()} chars remaining)`,
        tone: "critical",
      };
    }

    if (stats.isNearLimit) {
      return {
        message: `⚠️ Warning: ${stats.percentUsed.toFixed(0)}% of daily limit used (${stats.charsRemaining.toLocaleString()} chars remaining)`,
        tone: "warning",
      };
    }

    return {
      message: `📊 Daily usage: ${stats.charsUsed.toLocaleString()}/${stats.dailyLimit.toLocaleString()} chars (${stats.charsRemaining.toLocaleString()} remaining)`,
      tone: "info",
    };
  }

  /**
   * Validate translation batch against quota
   * @param texts Array of texts to translate
   */
  validateTranslationBatch(texts: string[]): {
    canProceed: boolean;
    totalChars: number;
    message: string;
    tone: "info" | "warning" | "critical";
  } {
    const totalChars = this.calculateCharCount(texts);
    const stats = this.getUsageStats();

    // Check if batch would exceed limit
    if (!this.canUseChars(totalChars)) {
      return {
        canProceed: false,
        totalChars,
        message: `❌ Cannot translate: This batch requires ${totalChars.toLocaleString()} chars but only ${stats.charsRemaining.toLocaleString()} remaining today. Try again tomorrow or reduce selection.`,
        tone: "critical",
      };
    }

    // Check if batch would put us over critical threshold
    const newTotal = stats.charsUsed + totalChars;
    const newPercent = (newTotal / DAILY_LIMIT_CHARS) * 100;

    if (newPercent >= CRITICAL_THRESHOLD * 100) {
      return {
        canProceed: true,
        totalChars,
        message: `⚠️ This translation will use ${totalChars.toLocaleString()} chars, leaving only ${(stats.charsRemaining - totalChars).toLocaleString()} remaining today.`,
        tone: "critical",
      };
    }

    if (newPercent >= WARNING_THRESHOLD * 100) {
      return {
        canProceed: true,
        totalChars,
        message: `This translation will use ${totalChars.toLocaleString()} chars. ${(stats.charsRemaining - totalChars).toLocaleString()} will remain today.`,
        tone: "warning",
      };
    }

    return {
      canProceed: true,
      totalChars,
      message: `Ready to translate ${texts.length} element(s) using ~${totalChars.toLocaleString()} chars.`,
      tone: "info",
    };
  }

  /**
   * Get time until reset (midnight UTC)
   */
  getTimeUntilReset(): {
    hours: number;
    minutes: number;
    message: string;
  } {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
    tomorrow.setUTCHours(0, 0, 0, 0);

    const msUntilReset = tomorrow.getTime() - now.getTime();
    const hours = Math.floor(msUntilReset / (1000 * 60 * 60));
    const minutes = Math.floor((msUntilReset % (1000 * 60 * 60)) / (1000 * 60));

    return {
      hours,
      minutes,
      message: `Limit resets in ${hours}h ${minutes}m`,
    };
  }

  /**
   * Reset usage (for testing or manual reset)
   */
  reset(): void {
    const data = this.createFreshUsageData();
    this.saveUsageData(data);
  }

  /**
   * Get tracking mode info
   */
  getTrackingInfo(): {
    mode: TrackingMode;
    userIdentifier?: string;
    description: string;
  } {
    const descriptions: Record<TrackingMode, string> = {
      localStorage: "Per-browser tracking (not synced across devices)",
      userBased:
        "User-based tracking (synced by Canva user, requires user identifier)",
      backend: "Centralized tracking (requires backend API)",
    };

    return {
      mode: this.mode,
      userIdentifier: this.userIdentifier || undefined,
      description: descriptions[this.mode],
    };
  }
}

/**
 * Singleton instance for global usage tracker
 */
let globalTracker: UsageTracker | null = null;

/**
 * Get or create the global usage tracker instance
 * @param mode Tracking mode (default: localStorage)
 */
export function getGlobalTracker(
  mode: TrackingMode = "localStorage",
): UsageTracker {
  if (!globalTracker) {
    globalTracker = new UsageTracker(mode);
  }
  return globalTracker;
}

/**
 * Reset the global tracker (useful for testing)
 */
export function resetGlobalTracker(): void {
  if (globalTracker) {
    globalTracker.reset();
  }
  globalTracker = null;
}

/**
 * Hash a user token for privacy-preserving tracking
 * Note: This is a simple hash. For production, use a proper hashing library.
 * @param token User token to hash
 * @returns Hashed token
 */
export async function hashUserToken(token: string): Promise<string> {
  // Use Web Crypto API for proper hashing
  if (typeof crypto !== "undefined" && crypto.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(token);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  // Fallback: Simple hash (not cryptographically secure)
  let hash = 0;
  for (let i = 0; i < token.length; i++) {
    const char = token.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(16);
}

// Export convenience functions for backward compatibility
export const recordUsage = (charCount: number) =>
  getGlobalTracker().recordUsage(charCount);
export const canUseChars = (charCount: number) =>
  getGlobalTracker().canUseChars(charCount);
export const getUsageStats = () => getGlobalTracker().getUsageStats();
export const getUsageMessage = () => getGlobalTracker().getUsageMessage();
export const validateTranslationBatch = (texts: string[]) =>
  getGlobalTracker().validateTranslationBatch(texts);
export const calculateCharCount = (texts: string[]) =>
  getGlobalTracker().calculateCharCount(texts);
export const getTimeUntilReset = () => getGlobalTracker().getTimeUntilReset();

