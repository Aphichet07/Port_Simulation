import Image from "next/image";
import TradingViewWidget from "@/src/components/ui/test"
export default function Home() {
  return (
    <div className="w-full h-screen">
      <TradingViewWidget />
    </div>
  );
}
