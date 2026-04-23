"use client";

import Image from "next/image";
import TradingViewWidget from "@/src/components/ui/test"
import BonkChatWidget from "@/src/components/ui/bonk"
import HomePage from "@/src/components/overview/home";
import { LoginPage } from "@/src/components/authen/login";
import { RegisterPage } from "@/src/components/authen/regis";
import { useState } from "react";

export default function Home() {
  const [view, setView] = useState<'login' | 'regis'>('login');

const gotoSignUp = () => 
    setView('regis');

const gotoLogin = () =>
    setView('login');
  return (
    <main className="w-full h-screen">
      {view === 'login' && (
        <LoginPage 
          onRegister={gotoSignUp}
        />
      )}
      {view === 'regis' && (
        <RegisterPage 
          onLogin={gotoLogin}
        />
      )}
    </main>
  );
}
