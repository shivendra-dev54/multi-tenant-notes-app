"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { request } from "@/utils/requestHandler";

export default function SignUpPage() {
    const router = useRouter();

    const [form, setForm] = useState({ username: "", email: "", password: "" });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
            const res = await request(
                "/auth/sign_up",
                {
                    username: form.username,
                    email: form.email,
                    password: form.password,
                },
                "POST",
                true
            );

            const body = await res.json();
            
            if (body.success || body.message === "user with same username exists.") {
                router.push("/auth/sign_in");
            } else {
                console.log(body.message || "Sign up failed. Try again.");
            }
        } catch (err) {
            console.error(err);
            console.log("Something went wrong. Please try again.");
        }
    };

    return (
        <div className="min-h-content mt-40 bg-black text-white flex items-center justify-center px-6">
            <form
                onSubmit={handleSubmit}
                className="w-full max-w-md bg-gray-900 p-8 rounded-lg border border-gray-800"
            >
                <h2 className="text-2xl font-bold mb-6 text-center">Sign Up</h2>

                <input
                    type="text"
                    name="username"
                    placeholder="Username"
                    value={form.username}
                    onChange={handleChange}
                    className="w-full p-3 mb-4 bg-black border border-gray-700 rounded text-white"
                />

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
                    Sign Up
                </button>
            </form>
        </div>
    );
}
