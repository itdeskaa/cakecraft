"use client";

import { Download, ScanLine } from "lucide-react";

export function OrderQR({ qr, orderNo }: { qr: string; orderNo: string }) {
  return (
    <div className="relative mt-8 flex flex-col items-center rounded-3xl border border-line bg-cream/60 p-6">
      <p className="flex items-center gap-2 text-sm font-semibold text-muted">
        <ScanLine className="h-4 w-4 text-brand" /> Scan to track your order
      </p>
      <div className="mt-4 rounded-2xl bg-white p-3 shadow-sm ring-1 ring-line">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={qr} alt={`QR code to track order ${orderNo}`} width={200} height={200} className="h-48 w-48" />
      </div>
      <p className="mt-3 text-xs text-muted">Tracking ID</p>
      <p className="num text-lg font-bold tracking-wide">{orderNo}</p>

      <a
        href={qr}
        download={`tracking-${orderNo}.png`}
        className="btn-ghost mt-4 !py-2.5 text-sm"
      >
        <Download className="h-4 w-4" /> Download QR code
      </a>
    </div>
  );
}
