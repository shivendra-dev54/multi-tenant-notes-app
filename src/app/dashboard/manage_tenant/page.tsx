"use client";

import { useEffect, useState } from "react";
import { request } from "@/utils/requestHandler";

type Request = {
  id: number;
  user_id: number;
  tenant_id: number;
  status: string;
};

type UserTenant = {
  id: number;
  user_id: number;
  tenant_id: number;
  role: string;
};

type Note = {
  id: number;
  title: string;
  content: string;
  tenantId: number;
};

export default function ManageTenantPage() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [users, setUsers] = useState<UserTenant[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      setRequests([]);
      setUsers([]);
      setNotes([]);

      // fetch requests
      const reqRes = await request("/admin", undefined, "GET", true);
      const reqBody = await reqRes.json();
      if (reqRes.ok && reqBody.success) setRequests(reqBody.data || []);

      // fetch users in tenant
      const userRes = await request("/tenant/all", undefined, "GET", true);
      const userBody = await userRes.json();
      if (userRes.ok && userBody.success) setUsers(userBody.data || []);

      // fetch notes in tenant (if we have tenant id)
      const tenantId = userBody.data?.[0]?.tenant_id;
      if (tenantId) {
        const noteRes = await request(`/note/${tenantId}`, undefined, "GET", true);
        const noteBody = await noteRes.json();
        if (noteRes.ok && noteBody.success) setNotes(noteBody.data || []);
      }
    } catch (err: unknown) {
      console.error("Failed to fetch manage tenant data", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRequest = async (id: number, response: "accept" | "reject") => {
    try {
      const res = await request(`/admin/${id}`, { response }, "POST", true);
      const body = await res.json();
      if (res.ok && body.success) fetchData();
    } catch (err) {
      console.error("Request update failed", err);
    }
  };

  const handleRemoveUser = async (userId: number) => {
    try {
      const res = await request(`/admin/${userId}`, undefined, "DELETE", true);
      const body = await res.json();
      if (res.ok && body.success) fetchData();
    } catch (err) {
      console.error("Remove user failed", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Loading tenant management...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white px-6 py-10 space-y-10">
      <h1 className="text-3xl font-bold text-center mb-8">Manage Tenant</h1>

      {/* Requests */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Join Requests</h2>
        {requests.length === 0 ? (
          <p className="text-gray-400">No pending requests</p>
        ) : (
          <div className="space-y-4">
            {requests.map((r) => (
              <div
                key={r.id}
                className="flex justify-between items-center bg-gray-900 border border-gray-800 rounded p-4"
              >
                <div>
                  <p>User ID: {r.user_id}</p>
                  <p>Status: {r.status}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleRequest(r.id, "accept")}
                    className="px-3 py-2 bg-green-600 hover:bg-green-500 rounded"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleRequest(r.id, "reject")}
                    className="px-3 py-2 bg-red-600 hover:bg-red-500 rounded"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Users */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Users in Tenant</h2>
        {users.length === 0 ? (
          <p className="text-gray-400">No users in tenant</p>
        ) : (
          <div className="space-y-4">
            {users.map((u) => (
              <div
                key={u.id}
                className="flex justify-between items-center bg-gray-900 border border-gray-800 rounded p-4"
              >
                <div>
                  <p>User ID: {u.user_id}</p>
                  <p>Role: {u.role}</p>
                </div>
                {u.role !== "Admin" && (
                  <button
                    onClick={() => handleRemoveUser(u.user_id)}
                    className="px-3 py-2 bg-red-600 hover:bg-red-500 rounded"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Notes */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Notes</h2>
        {notes.length === 0 ? (
          <p className="text-gray-400">No notes in tenant</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {notes.map((n) => (
              <div
                key={n.id}
                className="bg-gray-900 border border-gray-800 rounded p-4"
              >
                <h3 className="text-lg font-semibold">{n.title}</h3>
                <p className="text-gray-400 mt-2">{n.content}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
