"use client";
import { useState } from "react";
import Link from "next/link";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="bg-white p-10 rounded-xl shadow-xl w-full max-w-sm">
        <h1 className="font-serif text-3xl text-soil mb-6 text-center">
          Create Account
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
    await fetch("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    alert("Account Created! Please Login");
  }}
  className="w-full bg-clay text-white py-2 rounded"
>
  Sign Up
</button>


        <p className="text-sm text-center mt-4">
          Already have account?{" "}
          <Link href="/login" className="underline">Login</Link>
        </p>
      </div>
    </main>
  );
}
