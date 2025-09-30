"use client";

import { useEffect, useState } from "react";
import { request } from "@/utils/requestHandler";

export default function YouPage() {
  type TenantRelation = {
    id: number;
    tenant_id: number;
    user_id: number;
    role: string;
  } | null;

  type TenantRequest = {
    id: number;
    tenant_id: number;
    user_id: number;
    status: string;
  };

  const [tenant, setTenant] = useState<TenantRelation>(null);
  const [form, setForm] = useState({ name: "", desc: "" });
  const [requests, setRequests] = useState<TenantRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Check if user is admin of a tenant
      const res = await request("/tenant", undefined, "GET", true);
      const body = await res.json();
      if (res.ok && body.success) {
        // body.data is UsersTenants relation for admin
        setTenant(body.data || null);
      } else if (res.status === 404) {
        setTenant(null);
      } else {
        setError(body?.message || "Failed to fetch tenant");
      }

      // fetch requests (if any)
      const req = await request("/admin", undefined, "GET", true);
      const reqBody = await req.json();
      if (req.ok && reqBody.success) {
        setRequests(reqBody.data || []);
      } else {
        // if 404, no tenant owned by user — ignore
        setRequests([]);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const createTenant = async () => {
    setError(null);
    try {
      const res = await request("/tenant", { name: form.name, desc: form.desc }, "POST", true);
      const body = await res.json();
      if (res.ok && body.success) {
        await fetchData();
        setForm({ name: "", desc: "" });
      } else {
        setError(body?.message || "Create failed");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
    }
  };

  const updateTenant = async () => {
    setError(null);
    try {
      const res = await request("/tenant", { name: form.name, desc: form.desc }, "PUT", true);
      const body = await res.json();
      if (res.ok && body.success) {
        await fetchData();
      } else {
        setError(body?.message || "Update failed");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
    }
  };

  const deleteTenant = async () => {
    setError(null);
    try {
      const res = await request("/tenant", undefined, "DELETE", true);
      const body = await res.json();
      if (res.ok && body.success) {
        await fetchData();
      } else {
        setError(body?.message || "Delete failed");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
    }
  };

  const respondRequest = async (id: number, response: "accept" | "reject") => {
    setError(null);
    try {
      const res = await request(`/admin/${id}`, { response }, "POST", true);
      const body = await res.json();
      if (res.ok && body.success) {
        await fetchData();
      } else {
        setError(body?.message || "Respond failed");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
    }
  };

  if (loading) {
    return <div className="text-gray-300">Loading...</div>;
  }

  return (
    <div>
      {error && <div className="text-red-400 mb-4">{error}</div>}

      {!tenant ? (
        <div>
          <h2 className="mb-4">Create Tenant</h2>
          <input
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="block mb-2 p-2 rounded bg-black border border-gray-700"
          />
          <input
            placeholder="Description"
            value={form.desc}
            onChange={(e) => setForm({ ...form, desc: e.target.value })}
            className="block mb-2 p-2 rounded bg-black border border-gray-700"
          />
          <button
            onClick={createTenant}
            className="bg-green-600 px-4 py-2 rounded hover:bg-green-500"
          >
            Create
          </button>
        </div>
      ) : (
        <div>
          <h2 className="mb-4">Manage Your Tenant</h2>
          <div className="mb-4">
            <input
              placeholder="Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="block mb-2 p-2 rounded bg-black border border-gray-700"
            />
            <input
              placeholder="Description"
              value={form.desc}
              onChange={(e) => setForm({ ...form, desc: e.target.value })}
              className="block mb-2 p-2 rounded bg-black border border-gray-700"
            />
            <button
              onClick={updateTenant}
              className="bg-blue-600 px-4 py-2 rounded mr-2 hover:bg-blue-500"
            >
              Update
            </button>
            <button
              onClick={deleteTenant}
              className="bg-red-600 px-4 py-2 rounded hover:bg-red-500"
            >
              Delete
            </button>
          </div>

          <h3 className="mt-6 mb-2">User Requests</h3>
          <ul>
            {requests.map((r) => (
              <li key={r.id} className="flex justify-between items-center bg-gray-800 p-3 rounded mb-2">
                <div>
                  <p className="font-medium">User ID: {r.user_id}</p>
                  <p className="text-sm text-gray-400">Status: {r.status}</p>
                </div>
                <div className="space-x-2">
                  <button
                    onClick={() => respondRequest(r.id, "accept")}
                    className="bg-green-600 px-2 py-1 rounded"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => respondRequest(r.id, "reject")}
                    className="bg-red-600 px-2 py-1 rounded"
                  >
                    Reject
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
