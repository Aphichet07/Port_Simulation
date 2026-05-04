"use client";

import React, { useState } from "react";
import {
  Home,
  Layers,
  ShoppingCart,
  History,
  User,
  Search,
  Bot,
  X,
} from "lucide-react";

import { AppHeader } from "../overview/header";
import BonkChatWidget from "../ui/bonk";
import CreatePortfolioForm from "../ui/createPort";

const TransactionLogsView = () => {
  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-[#B5F28B] selection:text-black flex flex-col h-screen overflow-hidden">
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Thai:wght@100..900&family=Work+Sans:ital,wght@0,100..900;1,100..900&display=swap');
        * { font-family: 'Work Sans', 'Noto Sans Thai', sans-serif !important; }
        .custom-scrollbar::-webkit-scrollbar { width: 5px; height: 5px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 10px; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `,
        }}
      />

      <AppHeader />

      <div className="flex-1 overflow-hidden px-3 sm:px-6 lg:px-8 pb-4 sm:pb-6 lg:pb-8">
        <CreatePortfolioForm/>
      </div>

      {/* Floating Bot */}
      <BonkChatWidget />
    </div>
  );
};

export default TransactionLogsView;
