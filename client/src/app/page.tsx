"use client";
import { useState } from "react";
import Image from "next/image";
import BonkChatWidget from "@/src/components/ui/bonk"
import HomePage from "@/src/components/overview/home";
import Myport from "@/src/components/my-port/my-port-page";
import AuthModal from "../components/authen/authModal";
<<<<<<< HEAD
import SimulateView from "@/src/components/simulate/simulate-page";
import TransactionLogsView from "../components/transaction/log-page";

=======
import OptimizationResult from "../components/ui/result";
import PortFolioForm from "@/src/components/ui/form"
import { useState } from "react";
>>>>>>> c30561fe96fa775c288bdf1ec0d7c558cee25759

export default function Home() {

  return (
<<<<<<< HEAD
    // <AuthModal/>
    <HomePage />
    // <Myport/>
    //<SimulateView/>
    //<TransactionLogsView/>
    
=======
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
>>>>>>> c30561fe96fa775c288bdf1ec0d7c558cee25759
  );
}
