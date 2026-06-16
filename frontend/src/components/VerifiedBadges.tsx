"use client";

import { BadgeCheck, Mail, ShieldCheck } from "lucide-react";

interface Props {
  email?: boolean;
  tc?: boolean;
  size?: "sm" | "md";
}

/** Bir kullanıcının doğrulanmış rozetlerini gösterir. */
export default function VerifiedBadges({ email, tc, size = "sm" }: Props) {
  if (!email && !tc) {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] text-gray-400">
        Doğrulanmamış
      </span>
    );
  }
  const px = size === "sm" ? "text-[11px] px-1.5 py-0.5" : "text-xs px-2 py-1";
  const ic = size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5";
  return (
    <span className="inline-flex items-center gap-1 flex-wrap">
      {tc && (
        <span className={`inline-flex items-center gap-1 ${px} rounded-full bg-green-50 text-green-700 font-medium`} title="TC kimliği doğrulanmış">
          <ShieldCheck className={ic} /> TC
        </span>
      )}
      {email && (
        <span className={`inline-flex items-center gap-1 ${px} rounded-full bg-teal-50 text-teal-700 font-medium`} title="E-posta doğrulanmış">
          <Mail className={ic} /> E-posta
        </span>
      )}
    </span>
  );
}
