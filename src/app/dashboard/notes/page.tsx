"use client";

import { useEffect, useState } from "react";
import { request } from "@/utils/requestHandler";

type TenantRelation = {
  id: number;
  tenant_id: number;
  user_id: number;
  role: string;
};

type Tenant = {
  id: number;
  name: string;
  description?: string;
};

type Note = {
  id: number;
  title: string;
  content: string;
  tenantId: number;
};

export default function NotesPage() {
  const [relations, setRelations] = useState<TenantRelation[]>([]);
  const [allTenants, setAllTenants] = useState<Tenant[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedTenantId, setSelectedTenantId] = useState<number | null>(null);
  const [form, setForm] = useState({ title: "", content: "" });
  const [loading, setLoading] = useState(true);
  const [notesLoading, setNotesLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRelationsAndTenants = async () => {
    setLoading(true);
    setError(null);
    try {
      const relRes = await request("/tenant/all", undefined, "GET", true);
      const relBody = await relRes.json();
      if (!relRes.ok || !relBody.success) throw new Error(relBody?.message || "Failed");
      setRelations(relBody.data || []);

      const tenantsRes = await request("/tenant/list", undefined, "GET", true);
      const tenantsBody = await tenantsRes.json();
      if (!tenantsRes.ok || !tenantsBody.success) throw new Error(tenantsBody?.message || "Failed");
      setAllTenants(tenantsBody.data || []);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRelationsAndTenants();
  }, []);

  const fetchNotes = async (tenantId: number) => {
    setSelectedTenantId(tenantId);
    setNotesLoading(true);
    setError(null);
    try {
      const res = await request(`/note/${tenantId}`, undefined, "GET", true);
      const body = await res.json();
      if (!res.ok || !body.success) throw new Error(body?.message || "Failed to fetch notes");
      setNotes(body.data || []);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
    } finally {
      setNotesLoading(false);
    }
  };

  const createNote = async () => {
    if (!selectedTenantId) return;
    setError(null);
    try {
      const res = await request("/note", { ...form, tenant_id: selectedTenantId }, "POST", true);
      const body = await res.json();
      if (!res.ok || !body.success) throw new Error(body?.message || "Create failed");
      // refresh notes
      await fetchNotes(selectedTenantId);
      setForm({ title: "", content: "" });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
    }
  };

  const tenantDisplay = (tenantId: number) => {
    const t = allTenants.find((x) => x.id === tenantId);
    return t ? t.name : `Tenant ${tenantId}`;
  };

  return (
    <div className="min-h-screen bg-black text-white px-6 py-10">
      <h2 className="text-2xl font-bold mb-4">Your Tenants</h2>

      {loading ? (
        <div className="text-gray-300">Loading tenants...</div>
      ) : error ? (
        <div className="text-red-400">{error}</div>
      ) : (
        <ul className="flex gap-4 mb-6 overflow-auto">
          {relations.map((rel) => (
            <li
              key={rel.id}
              onClick={() => fetchNotes(rel.tenant_id)}
              className={`cursor-pointer p-2 rounded ${
                selectedTenantId === rel.tenant_id ? "bg-gray-700" : "bg-gray-800"
              }`}
            >
              {tenantDisplay(rel.tenant_id)}
            </li>
          ))}
        </ul>
      )}

      {selectedTenantId && (
        <div>
          <h3 className="text-lg mb-2">Notes</h3>

          {notesLoading ? (
            <div className="text-gray-300">Loading notes...</div>
          ) : (
            <ul className="space-y-2 mb-4">
              {notes.map((n) => (
                <li key={n.id} className="bg-gray-800 p-3 rounded">
                  <strong className="block">{n.title}</strong>
                  <p className="text-sm text-gray-300">{n.content}</p>
                </li>
              ))}
            </ul>
          )}

          <div className="space-y-2 max-w-xl">
            <input
              type="text"
              placeholder="Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full p-2 rounded bg-black border border-gray-700"
            />
            <textarea
              placeholder="Content"
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              className="w-full p-2 rounded bg-black border border-gray-700"
            />
            <button
              onClick={createNote}
              className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-500"
            >
              Create Note
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
