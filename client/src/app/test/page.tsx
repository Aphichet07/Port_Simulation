"use client"; 
import { useState, useEffect } from "react";
import axios from "axios";
import BonkChatWidget from "@/src/components/ui/bonk";
import BacktestResult from "@/src/components/ui/backtest";

export default function TestPage() {
  const [reportData, setReportData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReport = async () => {
      const id = 14; 
      
      try {
        setIsLoading(true);
        const response = await axios.get(`http://localhost:7000/backtest/report/${id}`);
        setReportData(response.data);
      } catch (err: any) {
        console.error("Error fetching backtest report:", err);
        setError(err.message || "Failed to fetch data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchReport();
  }, []); 

  return (
    <div className="p-6">
      <BonkChatWidget />
      
      <div className="mt-8 border-t pt-8">
        <h2 className="text-xl font-bold mb-4">Backtest Report (ID: 14)</h2>
        
        {isLoading && (
          <div className="text-blue-500 font-semibold animate-pulse">
            กำลังโหลดข้อมูล...
          </div>
        )}
        
        {error && (
          <div className="text-red-500 bg-red-50 p-4 rounded border border-red-200">
            ⚠️ เกิดข้อผิดพลาด: {error}
          </div>
        )}
        
        {reportData && reportData.success && reportData.data && (
          <BacktestResult data={reportData.data} />
        )}
      </div>
    </div>
  );
}