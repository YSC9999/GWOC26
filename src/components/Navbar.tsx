import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="w-full bg-[#f5ebdf] border-b border-[#e6d6c2]">
      <div className="max-w-7xl mx-auto px-6 py-4 grid grid-cols-[auto,1fr,auto] items-center gap-y-3">

        {/* Logo */}
        <div className="font-serif text-2xl tracking-wide text-[#5a3e2b]">
          Basho
        </div>

        {/* Center Links (WRAPPING GRID) */}
        <div className="grid grid-cols-[repeat(auto-fit,minmax(90px,1fr))] gap-x-6 gap-y-2 text-xs tracking-widest uppercase text-[#5a3e2b] text-center">
          <Link href="/">Home</Link>
          <Link href="/about">About</Link>
          <Link href="/products">Products</Link>
          <Link href="/workshops">Workshops</Link>
          <Link href="/studio">Studio</Link>
          <Link href="/contact">Contact</Link>
        </div>

        {/* Right Side Actions */}
        <div className="grid grid-flow-col auto-cols-max gap-x-6 text-sm text-[#5a3e2b] whitespace-nowrap">
          <Link href="/account">Account</Link>
          <Link href="/logout">Logout</Link>
          <Link href="/admin">Admin</Link>
        </div>
      </div>
    </nav>
  );
}
