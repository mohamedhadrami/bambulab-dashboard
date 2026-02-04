// app/providers.tsx
'use client';

import AuthModal from '@/components/AuthModal';
import { WebSocketProvider } from '@/contexts/WebSocketContext';
import { HeroUIProvider } from "@heroui/react";
import { ThemeProvider as NextThemesProvider } from 'next-themes';

export function Providers({ children }: { children: React.ReactNode }) {

    return (
        <HeroUIProvider>
            <NextThemesProvider attribute="class" defaultTheme="dark">
                <WebSocketProvider>
                    <AuthModal />
                    {children}
                </WebSocketProvider>
            </NextThemesProvider>
        </HeroUIProvider>
    );
}
