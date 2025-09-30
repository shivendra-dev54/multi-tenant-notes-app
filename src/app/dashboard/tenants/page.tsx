"use client";

import { useEffect, useState } from "react";
import { request } from "@/utils/requestHandler";

type Tenant = {
  id: number;
  name: string;
  description?: string | null;
  is_part_of: boolean;
};

export default function TenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTenants = async () => {
    try {
      const res = await request("/tenant/list", undefined, "GET", true);
      const body = await res.json();
      if (res.ok && body.success) {
        setTenants(body.data || []);
      } else {
        console.error(body?.message || "Failed to fetch tenants");
      }
    } catch (err) {
      console.error("Failed to fetch tenants", err);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (tenantId: number) => {
    try {
      const res = await request("/user", { tenant_id: tenantId }, "POST", true);
      const body = await res.json();
      if (res.ok && body.success) {
        await fetchTenants();
      } else {
        console.error(body?.message || "Apply failed");
      }
    } catch (err) {
      console.error("Apply failed", err);
    }
  };

  const handleLeave = async (tenantId: number) => {
    try {
      const res = await request(`/user/${tenantId}`, undefined, "DELETE", true);
      const body = await res.json();
      if (res.ok && body.success) {
        await fetchTenants();
      } else {
        console.error(body?.message || "Leave failed");
      }
    } catch (err) {
      console.error("Leave failed", err);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Loading tenants...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white px-6 py-10">
      <h1 className="text-3xl font-bold mb-6 text-center">Tenants</h1>

      {tenants.length === 0 ? (
        <p className="text-gray-400 text-center">No tenants available</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {tenants.map((tenant) => (
            <div
              key={tenant.id}
              className="bg-gray-900 border border-gray-800 rounded-lg p-6 flex flex-col justify-between"
            >
              <div>
                <h2 className="text-xl font-semibold">{tenant.name}</h2>
                <p className="text-gray-400 mt-2">{tenant.description || "No description"}</p>
                <p
                  className={`mt-3 text-sm ${
                    tenant.is_part_of ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {tenant.is_part_of ? "Joined" : "Not Joined"}
                </p>
              </div>

              <div className="mt-4 flex gap-3">
                {tenant.is_part_of ? (
                  <button
                    onClick={() => handleLeave(tenant.id)}
                    className="w-full py-2 bg-red-600 hover:bg-red-500 rounded"
                  >
                    Leave
                  </button>
                ) : (
                  <button
                    onClick={() => handleApply(tenant.id)}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-500 rounded"
                  >
                    Apply
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
