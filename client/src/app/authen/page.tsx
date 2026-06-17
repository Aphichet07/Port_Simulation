import { Suspense } from "react";
import AuthModal from "@/src/components/authen/authModal";

export default function Page() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center text-white font-sans">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
      </div>
    }>
      <AuthModal />
    </Suspense>
  );
}