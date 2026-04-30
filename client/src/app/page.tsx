"use client";
import { useState } from "react";
import Image from "next/image";
import BonkChatWidget from "@/src/components/ui/bonk"
import HomePage from "@/src/components/overview/home";
import Myport from "@/src/components/my-port/my-port-page";
import AuthModal from "../components/authen/authModal";
import OptimizationResult from "../components/ui/result";
import PortFolioForm from "@/src/components/ui/form"

export default function Home() {

  return (
    <HomePage />
    // <div>
    //   <BonkChatWidget></BonkChatWidget>
    //   <PortFolioForm/>
    // </div>
  );
}
