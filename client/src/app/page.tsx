import Image from "next/image";
import TradingViewWidget from "@/src/components/ui/test"
import BonkChatWidget from "@/src/components/ui/bonk"

export default function Home() {
  return (
    <div className="w-full h-screen">
      <BonkChatWidget />
    </div>
  );
}
