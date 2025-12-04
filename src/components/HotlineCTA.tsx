"use client";

import React from "react";

export default function HotlineCTA({ phone, label }: { phone: string; label?: string }) {
  return (
    <div className="rounded-lg border border-red-800 bg-red-950 px-3 py-3 text-center">
      <a
        href={`tel:${phone}`}
        className="inline-block w-full rounded-full bg-red-400 px-4 py-3 font-semibold text-red-950"
      >
        {label || `Call ${phone}`}
      </a>
    </div>
  );
}
