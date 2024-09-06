import React, { Suspense } from "react";
import type { Metadata } from "next";
import { Inter as FontSans } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import CustomNavbar from "@/components/Navigation/Navbar/Navbar";
import Sidebar from "@/components/Navigation/Sidebar/Sidebar";
import LoadingSuspense from "./loading";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Bambu Lab Dashboard",
  description: "IOT Dashboard for mesh network of ESP8266 communicating to MQTT server",
};

const RootLayout: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  return (
    <html lang="en" className="dark">
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable
        )}
      >
        <Providers>
          <div className="flex flex-col min-h-screen">
            <CustomNavbar />
            <div className="flex flex-1">
              <Sidebar />
              <Suspense fallback={<LoadingSuspense />}>
                <main className="flex-1 p-5 bg-gradient-to-br from-primary-50 to-primary-300 dark:from-primary-800 dark:to-primary-950">{children}</main>
              </Suspense>
              <Toaster />
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}

export default RootLayout;
