export const getStoredToken = () => {
  if (typeof window !== 'undefined') {
    try {
      return localStorage.getItem('tpo_token');
    } catch {
      return null;
    }
  }
  return null;
};

export const storeToken = (token: string) => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('tpo_token', token);
    } catch {
      // Cookie-based sessions remain as a fallback when storage is unavailable.
    }
  }
};

export const clearToken = () => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem('tpo_token');
    } catch {
      // Ignore storage failures; the next validation attempt will still fail closed.
    }
  }
};
