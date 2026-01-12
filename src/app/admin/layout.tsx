import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin-guard";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    await requireAdmin();
  } catch (error) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-sand">
      {/* Centered admin container (matches navbar max width) */}
      <main className="mx-auto w-11/12 max-w-6xl p-8">{children}</main>
    </div>
  );
}
