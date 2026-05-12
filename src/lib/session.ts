export const getStudentId = (): string => {
    // Only runs on client side — never on server
    if (typeof window === 'undefined') return ''
    if (typeof document === 'undefined') return ''
    
    try {
      const match = document.cookie.match(/bracu_display_id=([^;]+)/)
      return match ? decodeURIComponent(match[1]) : ''
    } catch {
      return ''
    }
  }