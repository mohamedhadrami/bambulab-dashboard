// hooks/useAuth.ts
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

const useAuth = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const res = await fetch(`/api/cookies?param=token`);
                if (res.status === 200) {
                    setIsAuthenticated(true);
                } else {
                    setIsAuthenticated(false);
                    if (pathname !== '/login') {
                        setIsModalOpen(true);
                    }
                }
            } catch (error) {
                console.error('Failed to check authentication', error);
                setIsAuthenticated(false);
                if (pathname !== '/login') {
                    setIsModalOpen(true);
                }
            }
        };

        checkAuth();
    }, [pathname]);

    const closeModal = () => {
        setIsModalOpen(false);
    };

    const handleLogIn = async (email: string, password: string, isRemember: boolean) => {
        try {
            const response = await fetch('/api/auth', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password, isRemember }),
            });

            const data = await response.json();

            if (!response.ok) {
                return new Error(data.error)
            }

        } catch (error) {
            return new Error('An error occurred. Please try again.');
        } finally {
            window.location.reload();
        }
    }

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout');
            window.location.reload();
        } catch (error) {
            throw new Error('An error occurred. Please try again.');
        }
    }

    return { isAuthenticated, isModalOpen, closeModal, handleLogIn, handleLogout };
};

export default useAuth;
