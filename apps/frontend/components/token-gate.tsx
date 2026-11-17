'use client';

import { useEffect, useState, ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { authAPI, staffAuthAPI } from '@/lib/api';
import { getStoredToken, clearToken } from '@/lib/token';
import { Redirecting } from '@/components/Redirecting';

interface TokenGateProps {
  children: ReactNode;
  /** Only signed-in staff may view (recruiter access links are not enough). */
  staffOnly?: boolean;
}

export const TokenGate = ({ children, staffOnly = false }: TokenGateProps) => {
  const [isValidating, setIsValidating] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const loginUrl = `/login?next=${encodeURIComponent(pathname || '/')}`;

    const validate = async () => {
      if (staffOnly) {
        try {
          await staffAuthAPI.me();
          setIsValidating(false);
        } catch {
          router.push(loginUrl);
        }
        return;
      }

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

        // Both failed: send staff to the sign-in page (recruiters without a valid
        // link also land here and can see how to request access).
        router.push(loginUrl);
      } catch (error) {
        console.error('Validation gate error:', error);
        router.push(loginUrl);
      }
    };

    validate();
  }, [router, pathname, staffOnly]);

  if (isValidating) {
    return <Redirecting />;
  }

  return <>{children}</>;
};
