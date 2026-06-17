import HomePage from "@/src/components/overview/home";
import { Suspense } from "react";

export default function Page() { 
  return (
    <Suspense fallback={<div className="min-h-screen bg-black text-white flex items-center justify-center font-sans">Initializing Terminal...</div>}>
      <HomePage />
    </Suspense>
  ); 
}