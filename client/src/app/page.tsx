"use client";

import Image from "next/image";
import BonkChatWidget from "@/src/components/ui/bonk"
import HomePage from "@/src/components/overview/home";
import AuthModal from "../components/authen/authModal";
import OptimizationResult from "../components/ui/result";
import PortFolioForm from "@/src/components/ui/form"
import { useState } from "react";

export default function Home() {
  const [view, setView] = useState<'login' | 'regis'>('login');

const gotoSignUp = () => 
    setView('regis');

const gotoLogin = () =>
    setView('login');
  return (
    <div>
      <BonkChatWidget></BonkChatWidget>
      <PortFolioForm/>
    </div>
    // <AuthModal/>
    // <main className="w-full h-screen">
    //   {view === 'login' && (
    //     <LoginPage 
    //       onRegister={gotoSignUp}
    //     />
    //   )}
    //   {view === 'regis' && (
    //     <RegisterPage 
    //       onLogin={gotoLogin}
    //     />
    //   )}
    // </main>
  );
}
