"use client";

import { useState } from "react";
import ClientHeader from "@/app/client/components/ClientHeader";
import HeroBanner from "../components/HeroBanner";
import LeftPanel from "../components/LeftPanel";
import RightPanel from "../components/RightPanel";
import AccountSummaryFooter from "../components/AccountSummaryFooter";

export default function DashboardClient() {
  const [leftReady, setLeftReady] = useState(false);
  const [rightReady, setRightReady] = useState(false);

  const isReady = leftReady && rightReady;

  return (
    <div className="min-h-screen bg-white relative">
      {!isReady && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
          <div className="w-6 h-6 border-2 border-[#005DAA] border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      <div className={isReady ? "visible" : "invisible"}>
        <ClientHeader />
        <HeroBanner />

        <div className="max-w-[1200px] mx-auto px-6 mt-6 grid grid-cols-[2fr_1fr] gap-6">
          <LeftPanel onLoaded={() => setLeftReady(true)} />
          <RightPanel onLoaded={() => setRightReady(true)} />
        </div>

        <AccountSummaryFooter />
      </div>
    </div>
  );
}
