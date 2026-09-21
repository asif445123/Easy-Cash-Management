"use client";

import { useRouter } from "next/navigation";
import DemoPageShell from "@/components/demo/DemoPageShell";
import DemoTable from "@/components/demo/DemoTable";
import { promptCreateAccount } from "@/components/demo/promptCreateAccount";
import { demoAccountsMaster } from "@/lib/demoData";
import { fmtNum } from "@/lib/demoFormat";
import { FaPlus } from "react-icons/fa";

export default function DemoAccountsMasterPage() {
  const router = useRouter();

  return (
    <DemoPageShell
      title="Accounts Master File"
      description="Every individual account you use across cash book, journal vouchers, and reports — with an opening balance."
    >
      <div className="flex justify-end mb-3">
        <button
          onClick={() => promptCreateAccount(router, "Add account")}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-colors"
        >
          <FaPlus size={10} /> Add account
        </button>
      </div>

      <DemoTable
        keyField="code"
        columns={[
          { key: "code", label: "Code" },
          { key: "description", label: "Description" },
          { key: "type", label: "Type" },
          { key: "opDebit", label: "Op. Debit", align: "right", render: (r) => fmtNum(r.opDebit) },
          { key: "opCredit", label: "Op. Credit", align: "right", render: (r) => fmtNum(r.opCredit) },
        ]}
        rows={demoAccountsMaster}
      />
    </DemoPageShell>
  );
}
