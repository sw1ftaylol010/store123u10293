// 🔒 Simple In-Memory Rate Limiter
// For production, use Redis-based solution (@upstash/ratelimit)

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Cleanup old entries every minute
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetAt < now) {
      rateLimitStore.delete(key);
    }
  }
}, 60000);

export interface RateLimitOptions {
  /**
   * Maximum number of requests allowed
   */
  limit: number;
  
  /**
   * Time window in seconds
   */
  window: number;
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  reset: number;
}

/**
 * Simple in-memory rate limiter
 * 
 * @param identifier - Unique identifier (IP, user ID, etc.)
 * @param options - Rate limit options
 * @returns Rate limit result
 * 
 * @example
 * const result = rateLimit(ip, { limit: 10, window: 60 });
 * if (!result.success) {
 *   return Response with 429
 * }
 */
export function rateLimit(
  identifier: string,
  options: RateLimitOptions
): RateLimitResult {
  const now = Date.now();
  const windowMs = options.window * 1000;
  const resetAt = now + windowMs;

  const entry = rateLimitStore.get(identifier);

  if (!entry || entry.resetAt < now) {
    // First request or window expired
    rateLimitStore.set(identifier, {
      count: 1,
      resetAt,
    });

    return {
      success: true,
      remaining: options.limit - 1,
      reset: resetAt,
    };
  }

  if (entry.count >= options.limit) {
    // Rate limit exceeded
    return {
      success: false,
      remaining: 0,
      reset: entry.resetAt,
    };
  }

  // Increment counter
  entry.count++;
  rateLimitStore.set(identifier, entry);

  return {
    success: true,
    remaining: options.limit - entry.count,
    reset: entry.resetAt,
  };
}

/**
 * Get rate limit identifier from request
 * Uses IP address or falls back to 'unknown'
 */
export function getRateLimitIdentifier(request: Request): string {
  const headers = request.headers;
  const ip = 
    headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    headers.get('x-real-ip') ||
    headers.get('cf-connecting-ip') || // Cloudflare
    'unknown';
  
  return ip;
}

/**
 * Preset rate limit configurations
 */
export const RATE_LIMITS = {
  // Strict for payment-related endpoints
  ORDERS: { limit: 5, window: 60 }, // 5 orders per minute
  WEBHOOKS: { limit: 100, window: 60 }, // 100 webhooks per minute
  
  // Moderate for analytics
  EVENTS: { limit: 100, window: 60 }, // 100 events per minute
  
  // Lenient for general API
  API: { limit: 60, window: 60 }, // 60 requests per minute
} as const;

/**
 * Rate limit middleware wrapper
 * 
 * @example
 * export async function POST(request: NextRequest) {
 *   const rateLimitResult = await withRateLimit(request, RATE_LIMITS.ORDERS);
 *   if (!rateLimitResult.success) {
 *     return rateLimitResult.response;
 *   }
 *   
 *   // ... your handler code
 * }
 */
export async function withRateLimit(
  request: Request,
  options: RateLimitOptions
): Promise<{
  success: boolean;
  response?: Response;
}> {
  const identifier = getRateLimitIdentifier(request);
  const result = rateLimit(identifier, options);

  if (!result.success) {
    return {
      success: false,
      response: new Response(
        JSON.stringify({
          error: 'Too many requests. Please try again later.',
          retryAfter: Math.ceil((result.reset - Date.now()) / 1000),
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': options.limit.toString(),
            'X-RateLimit-Remaining': result.remaining.toString(),
            'X-RateLimit-Reset': result.reset.toString(),
            'Retry-After': Math.ceil((result.reset - Date.now()) / 1000).toString(),
          },
        }
      ),
    };
  }

  return { success: true };
}

