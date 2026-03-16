import ClientHeader from "@/app/client/components/ClientHeader";
import HeroBanner from "../components/HeroBanner";
import LeftPanel from "../components/LeftPanel";
import RightPanel from "../components/RightPanel";
import AccountSummaryFooter from "../components/AccountSummaryFooter";

export const metadata = {
  title: "Business Accounts - RBC Online Banking",
};

export default function Dashboard() {

  return (

    <div className="min-h-screen bg-white">

      {/* HEADER */}
      <ClientHeader />

      {/* HERO BANNER */}
      <HeroBanner />

      {/* MAIN DASHBOARD CONTENT */}
      <div className="max-w-[1200px] mx-auto px-6 mt-6 grid grid-cols-[2fr_1fr] gap-6">

        {/* LEFT SIDE */}
        <LeftPanel />

        {/* RIGHT SIDE */}
        <RightPanel />

      </div>

      <AccountSummaryFooter />

    </div>

  );
}