// Client-side rate limiting using localStorage timestamps

interface RateLimitConfig {
    key: string
    limitMs?: number    // How long to wait between actions (ms)
    maxAttempts?: number // Max attempts within the window
  }
  
  export const checkRateLimit = ({ key, limitMs = 60000, maxAttempts = 3 }: RateLimitConfig): { allowed: boolean; waitSeconds: number } => {
    if (typeof window === 'undefined') return { allowed: true, waitSeconds: 0 }
  
    const storageKey = `rl_${key}`
    const now = Date.now()
  
    try {
      const stored = localStorage.getItem(storageKey)
      const data = stored ? JSON.parse(stored) : { attempts: 0, firstAttempt: now, lastAttempt: 0 }
  
      // Reset window if enough time has passed
      if (now - data.firstAttempt > limitMs) {
        localStorage.setItem(storageKey, JSON.stringify({ attempts: 1, firstAttempt: now, lastAttempt: now }))
        return { allowed: true, waitSeconds: 0 }
      }
  
      // Check if max attempts exceeded
      if (data.attempts >= maxAttempts) {
        const waitMs = limitMs - (now - data.firstAttempt)
        const waitSeconds = Math.ceil(waitMs / 1000)
        return { allowed: false, waitSeconds }
      }
  
      // Increment attempts
      localStorage.setItem(storageKey, JSON.stringify({
        attempts: data.attempts + 1,
        firstAttempt: data.firstAttempt,
        lastAttempt: now,
      }))
  
      return { allowed: true, waitSeconds: 0 }
  
    } catch {
      return { allowed: true, waitSeconds: 0 }
    }
  }
  
  export const resetRateLimit = (key: string) => {
    if (typeof window === 'undefined') return
    localStorage.removeItem(`rl_${key}`)
  }