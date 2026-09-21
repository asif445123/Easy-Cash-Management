"use client";

import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import AdminHeader from "@/components/AdminHeader";

interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

export default function AdminPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadUsers() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users", { cache: "no-store" });
      const data = await res.json();
      setUsers(data.users || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  async function updateStatus(id: string, status: "approved" | "rejected") {
    const result = await Swal.fire({
      icon: "question",
      title: status === "approved" ? "Approve this user?" : "Reject this user?",
      showCancelButton: true,
      confirmButtonText: status === "approved" ? "Approve" : "Reject",
      confirmButtonColor: status === "approved" ? "#0E7C4A" : "#B3452C",
    });
    if (!result.isConfirmed) return;

    const res = await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    if (res.ok) {
      Swal.fire({ icon: "success", title: "Updated", timer: 1000, showConfirmButton: false });
      loadUsers();
    } else {
      Swal.fire({ icon: "error", title: "Failed to update user" });
    }
  }

  return (
    <main className="min-h-screen bg-paper">
      <AdminHeader />

      <div className="max-w-5xl mx-auto px-6 pb-16">
        <h1 className="font-display text-2xl font-bold text-ink mb-6">User approvals</h1>

        {loading ? (
          <p className="text-ink/50 text-sm">Loading users…</p>
        ) : (
          <div className="bg-white rounded-2xl border border-ink/10 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-ink/[0.03] text-ink/50 text-xs uppercase tracking-wide">
                <tr>
                  <th className="text-left px-5 py-3">Name</th>
                  <th className="text-left px-5 py-3">Email</th>
                  <th className="text-left px-5 py-3">Status</th>
                  <th className="text-right px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/5">
                {users.map((u) => (
                  <tr key={u._id}>
                    <td className="px-5 py-3 font-medium text-ink">{u.name}</td>
                    <td className="px-5 py-3 text-ink/70">{u.email}</td>
                    <td className="px-5 py-3">
                      <StatusBadge status={u.status} />
                    </td>
                    <td className="px-5 py-3 text-right space-x-2">
                      {u.status !== "approved" && (
                        <button
                          onClick={() => updateStatus(u._id, "approved")}
                          className="px-3 py-1.5 rounded-full bg-primary text-white text-xs font-medium hover:bg-primary-dark transition-colors"
                        >
                          Approve
                        </button>
                      )}
                      {u.status !== "rejected" && (
                        <button
                          onClick={() => updateStatus(u._id, "rejected")}
                          className="px-3 py-1.5 rounded-full border border-danger/30 text-danger text-xs font-medium hover:bg-danger/5 transition-colors"
                        >
                          Reject
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-5 py-8 text-center text-ink/40">
                      No users yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}

function StatusBadge({ status }: { status: AdminUser["status"] }) {
  const styles = {
    pending: "bg-accent/15 text-accent",
    approved: "bg-primary/10 text-primary",
    rejected: "bg-danger/10 text-danger",
  } as const;
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${styles[status]}`}>
      {status}
    </span>
  );
}
