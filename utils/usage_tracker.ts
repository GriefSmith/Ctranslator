/**
 * Usage Tracker for MyMemory API
 * Manages daily character limits and tracks usage to prevent exceeding free tier
 * 
 * MyMemory API Limits:
 * - Anonymous: 5,000 chars/day
 * - With email: 50,000 chars/day (we use this)
 * - Whitelisted: 150,000 chars/day (requires application)
 */

// Configuration
const DAILY_LIMIT_CHARS = 45000; // 45k to stay under 50k limit with buffer
const STORAGE_KEY = "ctranslator_usage";
const WARNING_THRESHOLD = 0.8; // Warn at 80% usage
const CRITICAL_THRESHOLD = 0.95; // Critical warning at 95%

// Usage data structure
interface UsageData {
  date: string; // YYYY-MM-DD format
  charsUsed: number;
  requestCount: number;
  lastUpdated: number; // timestamp
}

/**
 * Get current date in YYYY-MM-DD format (UTC)
 */
const getCurrentDate = (): string => {
  const now = new Date();
  return now.toISOString().split("T")[0];
};

/**
 * Load usage data from localStorage
 */
const loadUsageData = (): UsageData => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const data: UsageData = JSON.parse(stored);
      
      // Reset if it's a new day
      if (data.date !== getCurrentDate()) {
        return {
          date: getCurrentDate(),
          charsUsed: 0,
          requestCount: 0,
          lastUpdated: Date.now(),
        };
      }
      
      return data;
    }
  } catch (error) {
    console.error("Failed to load usage data:", error);
  }
  
  // Default data for first use or error
  return {
    date: getCurrentDate(),
    charsUsed: 0,
    requestCount: 0,
    lastUpdated: Date.now(),
  };
};

/**
 * Save usage data to localStorage
 */
const saveUsageData = (data: UsageData): void => {
  try {
    data.lastUpdated = Date.now();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("Failed to save usage data:", error);
  }
};

/**
 * Record character usage
 */
export const recordUsage = (charCount: number): void => {
  const data = loadUsageData();
  data.charsUsed += charCount;
  data.requestCount += 1;
  saveUsageData(data);
};

/**
 * Check if adding more characters would exceed the daily limit
 */
export const canUseChars = (charCount: number): boolean => {
  const data = loadUsageData();
  return data.charsUsed + charCount <= DAILY_LIMIT_CHARS;
};

/**
 * Get current usage statistics
 */
export const getUsageStats = (): {
  charsUsed: number;
  charsRemaining: number;
  percentUsed: number;
  requestCount: number;
  dailyLimit: number;
  isNearLimit: boolean;
  isCritical: boolean;
  date: string;
} => {
  const data = loadUsageData();
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
  };
};

/**
 * Calculate total character count for texts
 */
export const calculateCharCount = (texts: string[]): number => {
  return texts.reduce((total, text) => {
    // Clean and count actual characters that will be sent to API
    const cleaned = text.trim();
    return total + cleaned.length;
  }, 0);
};

/**
 * Estimate character count considering cleaning and formatting
 */
export const estimateCharCount = (text: string): number => {
  // Account for URL encoding overhead (~10-20% for special chars)
  const baseCount = text.trim().length;
  const encodingOverhead = Math.ceil(baseCount * 0.15);
  return baseCount + encodingOverhead;
};

/**
 * Get user-friendly usage message
 */
export const getUsageMessage = (): {
  message: string;
  tone: "info" | "warning" | "critical";
} => {
  const stats = getUsageStats();
  
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
};

/**
 * Check if translation batch can proceed
 */
export const validateTranslationBatch = (
  texts: string[]
): {
  canProceed: boolean;
  totalChars: number;
  message: string;
  tone: "info" | "warning" | "critical";
} => {
  const totalChars = calculateCharCount(texts);
  const stats = getUsageStats();
  
  // Check if batch would exceed limit
  if (!canUseChars(totalChars)) {
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
};

/**
 * Reset usage (for testing or manual reset)
 */
export const resetUsage = (): void => {
  const data: UsageData = {
    date: getCurrentDate(),
    charsUsed: 0,
    requestCount: 0,
    lastUpdated: Date.now(),
  };
  saveUsageData(data);
};

/**
 * Get time until reset (midnight UTC)
 */
export const getTimeUntilReset = (): {
  hours: number;
  minutes: number;
  message: string;
} => {
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
};

