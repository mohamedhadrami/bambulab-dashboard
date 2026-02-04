"use client";

import { Button, Card, CardBody, Input } from "@heroui/react";
import React, { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type Stage = "verifyCode" | "tfa" | null;

const Page: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [token, setToken] = useState<any>();
  const [expirationDate, setExpirationDate] = useState<string>();

  const [stage, setStage] = useState<Stage>(null);
  const [code, setCode] = useState<string>("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const isCodeStep = useMemo(() => stage === "verifyCode" || stage === "tfa", [stage]);
  const codeLabel = stage === "tfa" ? "MFA Code" : "Verification Code";
  const subtitle = isCodeStep
    ? stage === "tfa"
      ? "Enter the code from your authenticator app."
      : "Check your email for the verification code."
    : "Please sign in to retrieve token";

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/cookies?param=access_token", { cache: "no-store" });
        if (res.status === 200) {
          setIsLoggedIn(true);
          const resData = await res.json();
          const data = JSON.parse(resData.data.value);
          setToken(data);
          const date = new Date(data.exp * 1000).toString();
          setExpirationDate(date);
        } else {
          setIsLoggedIn(false);
        }
      } catch {
        setIsLoggedIn(false);
      }
    };

    checkAuth();
  }, []);

  const handleLogin = async () => {
    setIsSubmitting(true);
    setError(null);
    setInfo(null);

    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data?.stage === "verifyCode" || data?.stage === "tfa") {
          setStage(data.stage);
          setInfo(data.message ?? "Verification required.");
          setError(null);
          return;
        }

        setError(data?.error ?? "Login failed.");
        return;
      }

      setStage(null);
      setCode("");
      router.push(redirect);
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerify = async () => {
    if (!code.trim()) {
      setError("Please enter the code.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setInfo(null);

    try {
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });

      const data = await res.json();

      if (!res.ok || !data?.ok) {
        setError(data?.error || "Verification failed");
        return;
      }

      setStage(null);
      setCode("");
      router.push(redirect);
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout");
      window.location.reload();
    } catch {
      setError("An error occurred. Please try again.");
    }
  };

  const handleBackToLogin = () => {
    setStage(null);
    setCode("");
    setError(null);
    setInfo(null);
  };

  return (
    <div className="relative flex justify-center items-center h-full">
      {isLoggedIn ? (
        <div>
          <Button
            onPress={handleLogout}
            variant="ghost"
            color="success"
            className="absolute top-0 right-0"
          >
            Log Out
          </Button>
          <p className="font-extralight">You are already logged in</p>

          {token && expirationDate && (
            <div className="absolute bottom-4 right-4 max-w-xs font-thin text-success">
              Token expires {expirationDate}
            </div>
          )}
        </div>
      ) : (
        <Card className="w-1/2 min-w-max p-5 bg-primary-600 dark:bg-primary-800">
          <CardBody className="items-center gap-4">
            <p className="w-full justify-left font-thin">{subtitle}</p>

            {!isCodeStep ? (
              <>
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
              </>
            ) : (
              <>
                <Input
                  value={code}
                  type="text"
                  label={codeLabel}
                  variant="underlined"
                  onValueChange={setCode}
                  className="max-w-xs text-foreground w-full"
                />
                {stage === "verifyCode" && (
                  <p className="text-xs font-extralight opacity-80 max-w-xs">
                    Tip: check spam/junk if you don&apos;t see the email.
                  </p>
                )}
              </>
            )}

            {info && <p className="text-green-200 text-sm">{info}</p>}
            {error && <p className="text-red-300 text-sm">{error}</p>}

            <div className="flex mt-8 w-full gap-2">
              {!isCodeStep ? (
                <Button
                  onPress={handleLogin}
                  isLoading={isSubmitting}
                  variant="solid"
                  color="primary"
                  radius="sm"
                  className="w-full"
                >
                  Login
                </Button>
              ) : (
                <>
                  <Button
                    onPress={handleBackToLogin}
                    isDisabled={isSubmitting}
                    variant="flat"
                    color="default"
                    radius="sm"
                    className="w-1/3"
                  >
                    Back
                  </Button>
                  <Button
                    onPress={handleVerify}
                    isLoading={isSubmitting}
                    variant="solid"
                    color="primary"
                    radius="sm"
                    className="w-2/3"
                  >
                    Verify
                  </Button>
                </>
              )}
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
};

export default Page;
