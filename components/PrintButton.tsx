"use client";

import { Printer } from "lucide-react";

export function PrintButton() {
  const handlePrint = () => {
    window.print();
  };

  return (
    <button
      onClick={handlePrint}
      title="Print Document"
      className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 rounded-lg shadow-sm border border-slate-200/50 transition-all flex items-center justify-center print:hidden"
    >
      <Printer className="h-4.5 w-4.5" />
    </button>
  );
}
