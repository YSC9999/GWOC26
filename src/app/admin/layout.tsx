import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex bg-sand">
      {/* Sidebar */}
      <aside className="w-64 bg-soil text-sand p-6">
        <h2 className="text-2xl font-serif mb-8">Admin Dashboard</h2>

        <nav className="flex flex-col gap-4 text-sm uppercase tracking-widest">
          <Link href="/admin" className="hover:text-clay">
            Home
          </Link>
          <Link href="/admin/products" className="hover:text-clay">
            Collection
          </Link>
          <Link href="/admin/frames" className="hover:text-clay">
            Frames
          </Link>
          <Link href="/admin/blog" className="hover:text-clay">
            Blog
          </Link>
          <Link href="/admin/contact" className="hover:text-clay">
            Contact
          </Link>
        </nav>
      </aside>

      {/* Main */}
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
