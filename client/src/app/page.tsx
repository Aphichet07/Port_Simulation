"use client";
import { useState } from "react";
import Image from "next/image";
import BonkChatWidget from "@/src/components/ui/bonk"
import HomePage from "@/src/components/overview/home";
import Myport from "@/src/components/my-port/my-port-page";
import AuthModal from "../components/authen/authModal";
import SimulateView from "@/src/components/simulate/simulate-page";
import TransactionLogsView from "../components/transaction/log-page";


export default function Home() {

  return (
    // <AuthModal/>
    <HomePage />
    // <Myport/>
    //<SimulateView/>
    //<TransactionLogsView/>
    
  );
}
