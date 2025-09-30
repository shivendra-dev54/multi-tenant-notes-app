"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const navItems = [
    { href: "/dashboard/tenants", label: "Tenants" },
    { href: "/dashboard/notes", label: "Notes" },
    { href: "/dashboard/you", label: "You" },
    { href: "/dashboard/manage_tenant", label: "Manage Tenant" },
  ];

  return (
    <div className="min-h-screen flex bg-black text-white">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 p-6 flex flex-col space-y-4">
        <h1 className="text-2xl font-bold mb-6">Notes App</h1>
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`p-2 rounded hover:bg-gray-700 ${
              pathname === item.href ? "bg-gray-800" : ""
            }`}
          >
            {item.label}
          </Link>
        ))}
      </aside>

      {/* Main */}
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
