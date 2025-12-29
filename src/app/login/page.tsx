"use client";
import { useState } from "react";
import Link from "next/link";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="bg-white p-10 rounded-xl shadow-xl w-full max-w-sm">
        <h1 className="font-serif text-3xl text-soil mb-6 text-center">
          Login
        </h1>

        <input
          placeholder="Email"
          className="w-full border px-4 py-2 rounded mb-4"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full border px-4 py-2 rounded mb-6"
          onChange={(e) => setPassword(e.target.value)}
        />

       <button
  onClick={async () => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    if (res.ok) window.location.href = "/account";
    else alert("Login failed");
  }}
  className="w-full bg-clay text-white py-2 rounded"
>
  Login
</button>


        <p className="text-sm text-center mt-4">
          Don’t have account?{" "}
          <Link href="/signup" className="underline">Create one</Link>
        </p>
      </div>
    </main>
  );
}
