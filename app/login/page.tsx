"use client"

import { Button, Card, CardBody, Input } from "@nextui-org/react";
import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const Page: React.FC = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirect = searchParams.get('redirect') || '/';

    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
    const [token, setToken] = useState();
    const [expirationDate, setExpirationDate] = useState<string>();

    useEffect(() => {
        const checkAuth = async () => {
            const res = await fetch('/api/cookies?param=token');
            if (res.status === 200) {
                setIsLoggedIn(true);
                const resData = await res.json();
                const data = JSON.parse(resData.data.value);
                setToken(data);
                const date = new Date(data.exp * 1000).toString();
                setExpirationDate(date);
            }
            else setIsLoggedIn(false);
        };
        checkAuth();
    }, []);

    const handleLogin = async () => {
        try {
            const response = await fetch('/api/auth', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error);
                return;
            }

            setError(null);
            router.push(redirect);
        } catch (error) {
            setError('An error occurred. Please try again.');
        }
    };

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout');
            window.location.reload();
        } catch (error) {
            setError('An error occurred. Please try again.');
        }
    }

    return (
        <div className="relative flex justify-center items-center h-full">
            {isLoggedIn ? (
                <div>
                    <Button onPress={handleLogout} variant="ghost" color="success" className="absolute top-0 right-0">
                        Log Out
                    </Button>
                    <p className="font-extralight">You are already logged in</p>
                    {token && expirationDate &&
                        <div className="absolute bottom-4 right-4 max-w-xs font-thin text-success">
                            Token expires {expirationDate}
                        </div>
                    }
                </div>
            ) : (
                <Card className="w-1/2 min-w-max p-5 bg-primary-600 dark:bg-primary-800">
                    <CardBody className="items-center gap-4">
                        <p className="w-full justify-left font-thin">
                            Please sign in to retrieve token
                        </p>
                        <Input
                            value={email}
                            type="email"
                            label="Email"
                            variant="underlined"
                            errorMessage="Please enter a valid email"
                            onValueChange={setEmail}
                            className="max-w-xs text-foreground w-full"
                        />
                        <Input
                            value={password}
                            type="password"
                            label="Password"
                            variant="underlined"
                            onValueChange={setPassword}
                            className="max-w-xs text-foreground w-full"
                        />
                        {error && <p className="text-red-500">{error}</p>}
                        <div className="flex mt-8 w-full">
                            <Button onPress={handleLogin} variant="solid" color="primary" radius="sm" className="w-full">
                                Login
                            </Button>
                        </div>
                    </CardBody>
                </Card>
            )}
        </div>
    );
}

export default Page;
