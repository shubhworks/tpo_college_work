export const getStoredToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('tpo_token');
  }
  return null;
};

export const storeToken = (token: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('tpo_token', token);
  }
};

export const clearToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('tpo_token');
  }
};
