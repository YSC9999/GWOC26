import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";

export default async function Account() {
  const user = await getUser();
  if (!user) redirect("/login");

  return (
    <main className="pt-32 text-center">
      <h1 className="font-serif text-4xl">Welcome to Basho</h1>
      <p>You are logged in.</p>
    </main>
  );
}
