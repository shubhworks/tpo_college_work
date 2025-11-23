'use client';
import { Redirecting } from '@/components/Redirecting';
import { useEffect } from 'react';

const FormRedirect = () => {
    useEffect(() => {
        // Delay a bit just so the message can render
        const timer = setTimeout(() => {
            window.location.href =
                'https://forms.gle/n8f7bJ4jMWT7EBu96';
        }, 100); // slight delay to ensure text renders

        return () => clearTimeout(timer);
    }, []);

    return <Redirecting />;
};

export default FormRedirect;