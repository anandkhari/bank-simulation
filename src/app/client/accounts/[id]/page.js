"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useParams } from "next/navigation";
import ClientHeader from "../../components/ClientHeader";
import LeftPanel from "../../components/LeftPanel";
import RightDashboard from "../../components/RightPanel";
import LeftAccountPanel from "../../components/LeftAccountPanel";
import TransactionFooter from "../../components/TransactionFooter";


function Loader() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="w-12 h-12 border-4 border-[#1666AF] border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}

export default function AccountPage() {

  const { id } = useParams();

  const [account, setAccount] = useState(null);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {

    const loadAccount = async () => {

      const { data: accountData } = await supabase
        .from("accounts")
        .select("*")
        .eq("id", id)
        .single();

      if (accountData) {
        setAccount(accountData);
      }

      const { data: transactionData } = await supabase
        .from("transactions")
        .select("*")
        .eq("account_id", id)
        .order("date", { ascending: false });

      if (transactionData) {
        setTransactions(transactionData);
      }

    };

    loadAccount();

  }, [id]);

  if (!account) {
    return <Loader />;
  }


  return (
    
    <div className="bg-white ">
        
  <ClientHeader />

  

  <div className="max-w-6xl mx-auto grid grid-cols-[2fr_1fr] gap-8 px-8">

      <LeftAccountPanel />

      <RightDashboard />


  </div>

  <TransactionFooter />
  
</div>

  );

}