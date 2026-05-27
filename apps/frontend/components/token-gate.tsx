'use client';

import { useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { authAPI } from '@/lib/api';
import { getStoredToken, clearToken } from '@/lib/token';
import { Redirecting } from '@/components/Redirecting';

interface TokenGateProps {
  children: ReactNode;
}

export const TokenGate = ({ children }: TokenGateProps) => {
  const [isValidating, setIsValidating] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const validate = async () => {
      const storedToken = getStoredToken();
      
      try {
        if (storedToken) {
          // Verify localStorage token
          try {
            const response = await authAPI.validateToken(storedToken);
            if (response.data.success) {
              setIsValidating(false);
              return;
            }
          } catch (e) {
             // localStorage token might be invalid/expired, continue to check session
             clearToken();
          }
        }
        
        // Check session cookie (httpOnly, handled by browser)
        try {
          const sessionResponse = await authAPI.checkSession();
          if (sessionResponse.data.success) {
            setIsValidating(false);
            return;
          }
        } catch (e) {
          // Session invalid
        }

        // Both failed
        router.push('/access-denied');
      } catch (error) {
        console.error('Validation gate error:', error);
        router.push('/access-denied');
      }
    };

    validate();
  }, [router]);

  if (isValidating) {
    return <Redirecting />;
  }

  return <>{children}</>;
};
