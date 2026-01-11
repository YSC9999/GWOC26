import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-sand">
      {/* Centered admin container (matches navbar max width) */}
      <main className="mx-auto w-11/12 max-w-6xl p-8">{
        children
      }</main>
    </div>
  );
}
