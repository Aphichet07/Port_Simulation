import React from "react";
import { AlertTriangle } from "lucide-react";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  portfolioName: string;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  portfolioName,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity">
      <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-sm border border-slate-200 animate-in zoom-in-95 duration-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-500 shrink-0">
            <AlertTriangle size={20} />
          </div>
          <h2 className="text-lg font-bold text-slate-900">ยืนยันการลบ</h2>
        </div>
        
        <p className="text-slate-600 text-sm mb-6 leading-relaxed">
          คุณแน่ใจหรือไม่ที่จะลบพอร์ต <span className="font-bold text-slate-900">"{portfolioName}"</span> ? การกระทำนี้ไม่สามารถย้อนกลับได้
        </p>
        
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-bold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
          >
            ยกเลิก
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-bold text-white bg-red-500 rounded-xl hover:bg-red-600 transition-colors shadow-sm shadow-red-500/30"
          >
            ลบพอร์ต
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;