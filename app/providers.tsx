// app/providers.tsx
'use client';

import AuthModal from '@/components/AuthModal';
import { WebSocketProvider } from '@/contexts/WebSocketContext';
import { NextUIProvider } from '@nextui-org/react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';

export function Providers({ children }: { children: React.ReactNode }) {

    return (
        <NextUIProvider>
            <NextThemesProvider attribute="class" defaultTheme="dark">
                <WebSocketProvider>
                    <AuthModal />
                    {children}
                </WebSocketProvider>
            </NextThemesProvider>
        </NextUIProvider>
    );
}
