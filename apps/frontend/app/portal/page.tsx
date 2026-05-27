'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authAPI } from '@/lib/api';
import { storeToken } from '@/lib/token';
import { Redirecting } from '@/components/Redirecting';

function PortalContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      router.push('/access-denied');
      return;
    }

    const validate = async () => {
      try {
        const response = await authAPI.validateToken(token);
        if (response.data.success) {
          if (response.data.isPermanent) {
            storeToken(token);
          }
          router.push('/');
        } else {
          router.push('/access-denied');
        }
      } catch (error) {
        console.error('Validation error:', error);
        router.push('/access-denied');
      }
    };

    validate();
  }, [token, router]);

  return <Redirecting />;
}

export default function PortalPage() {
  return (
    <Suspense fallback={<Redirecting />}>
      <PortalContent />
    </Suspense>
  );
}
