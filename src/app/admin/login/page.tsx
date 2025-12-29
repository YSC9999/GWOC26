"use client";

import { useState } from "react";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#EDD8B4]">
      <div className="bg-white p-10 rounded-xl shadow-xl w-full max-w-sm">
        <h1 className="font-serif text-3xl text-soil mb-6 text-center">
          Basho Admin
        </h1>

        <input
          placeholder="Admin Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border px-4 py-2 rounded mb-4"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border px-4 py-2 rounded mb-6"
        />

        <button className="w-full bg-clay text-white py-2 rounded hover:opacity-90">
          Login
        </button>
      </div>
    </main>
  );
}
