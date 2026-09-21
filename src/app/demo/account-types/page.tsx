"use client";

import { useRouter } from "next/navigation";
import DemoPageShell from "@/components/demo/DemoPageShell";
import DemoTable from "@/components/demo/DemoTable";
import { promptCreateAccount } from "@/components/demo/promptCreateAccount";
import { demoAccountTypes } from "@/lib/demoData";
import { FaPlus } from "react-icons/fa";

export default function DemoAccountTypesPage() {
  const router = useRouter();

  return (
    <DemoPageShell
      title="Account Types"
      description="The building blocks every account in the system is grouped under — Cash, Bank, Payable, Receivable, Expenses, Income, and any custom types you add."
    >
      <div className="flex justify-end mb-3">
        <button
          onClick={() => promptCreateAccount(router, "Add account type")}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-colors"
        >
          <FaPlus size={10} /> Add account type
        </button>
      </div>

      <DemoTable
        keyField="serial"
        columns={[
          { key: "serial", label: "Serial #" },
          { key: "type", label: "Type" },
          { key: "receivablePayable", label: "Receivable / Payable", align: "center" },
          { key: "dashboard", label: "Dashboard", align: "center" },
        ]}
        rows={demoAccountTypes}
      />
    </DemoPageShell>
  );
}
