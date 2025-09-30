"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { request } from "@/utils/requestHandler";
import { useAuthStore } from "@/store/AuthStore";

export default function SignInPage() {
    const { setUser } = useAuthStore();
    const router = useRouter();

    const [form, setForm] = useState({ email: "", password: "" });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
            const res = await request(
                "/auth/sign_in",
                {
                    email: form.email,
                    password: form.password,
                },
                "POST"
            );
            const data = await res.json();

            if (data.success) {
                setUser(data.data);
                router.push("/dashboard");
            } else {
                alert(data.message || "Invalid credentials");
            }
        } catch (err) {
            console.error(err);
            alert("Something went wrong. Please try again.");
        }
    };

    return (
        <div className="min-h-content mt-40 bg-black text-white flex items-center justify-center px-6">
            <form
                onSubmit={handleSubmit}
                className="w-full max-w-md bg-gray-900 p-8 rounded-lg border border-gray-800"
            >
                <h2 className="text-2xl font-bold mb-6 text-center">Sign In</h2>

                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={form.email}
                    onChange={handleChange}
                    className="w-full p-3 mb-4 bg-black border border-gray-700 rounded text-white"
                />

                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={form.password}
                    onChange={handleChange}
                    className="w-full p-3 mb-6 bg-black border border-gray-700 rounded text-white"
                />

                <button
                    type="submit"
                    className="w-full p-3 bg-gray-800 hover:bg-gray-700 rounded text-white"
                >
                    Sign In
                </button>
            </form>
        </div>
    );
}
