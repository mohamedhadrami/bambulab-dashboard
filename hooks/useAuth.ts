// hooks/useAuth.ts
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

type AuthStage = "anonymous" | "authenticated" | "verifyCode" | "tfa";

export default function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [authStage, setAuthStage] = useState<AuthStage>("anonymous");
  const [authMessage, setAuthMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pathname = usePathname();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch(`/api/cookies?param=access_token`, { cache: "no-store" });
        if (res.status === 200) {
          setIsAuthenticated(true);
          setAuthStage("authenticated");
          setIsModalOpen(false);
          setAuthMessage(null);
        } else {
          setIsAuthenticated(false);
          setAuthStage("anonymous");
          if (pathname !== "/login") setIsModalOpen(true);
        }
      } catch (error) {
        console.error("Failed to check authentication", error);
        setIsAuthenticated(false);
        setAuthStage("anonymous");
        if (pathname !== "/login") setIsModalOpen(true);
      }
    };

    checkAuth();
  }, [pathname]);

  const closeModal = () => setIsModalOpen(false);

  const handleLogIn = async (email: string, password: string, isRemember: boolean) => {
    setIsSubmitting(true);
    setAuthMessage(null);

    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, isRemember }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data?.stage === "verifyCode" || data?.stage === "tfa") {
          setAuthStage(data.stage);
          setAuthMessage(data.message ?? "Verification required.");
          // keep modal open and switch UI
          setIsModalOpen(true);
          return;
        }

        setAuthMessage(data?.error ?? "Login failed.");
        return;
      }

      // success
      setIsAuthenticated(true);
      setAuthStage("authenticated");
      setIsModalOpen(false);
      window.location.reload();
    } catch (error) {
      setAuthMessage("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitVerificationCode = async (code: string) => {
    setIsSubmitting(true);
    setAuthMessage(null);

    try {
      const response = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });

      const data = await response.json();

      if (!response.ok || !data?.ok) {
        setAuthMessage(data?.error ?? "Verification failed.");
        return;
      }

      setIsAuthenticated(true);
      setAuthStage("authenticated");
      setIsModalOpen(false);
      window.location.reload();
    } catch {
      setAuthMessage("An error occurred verifying the code.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout");
    window.location.reload();
  };

  return {
    isAuthenticated,
    isModalOpen,
    closeModal,
    authStage,
    authMessage,
    isSubmitting,
    handleLogIn,
    submitVerificationCode,
    handleLogout,
  };
}
