import Link from "next/link";
export default function AdminDashboard() {
  return (
    <div>
      <h1 className="text-3xl font-serif font-bold text-soil mb-6">
        Admin Home
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/admin/products" className="card p-6 block hover:shadow-md transition-all border border-gray-100 group">
          <h3 className="text-xl font-semibold mb-2 group-hover:text-clay">Products</h3>
          <p className="text-sm text-gray-600">
            Manage collection items
          </p>
          <span className="text-clay mt-2 block">Manage Products</span>
        </Link>

        <Link href="/admin/orders" className="p-6 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all border border-gray-100 group">
          <h2 className="text-xl font-bold text-soil mb-2 group-hover:text-clay">Orders</h2>
          <p className="text-soil/60">View and manage customer orders</p>
        </Link>

        <Link href="/admin/coupons" className="p-6 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all border border-gray-100 group">
          <h2 className="text-xl font-bold text-soil mb-2 group-hover:text-clay">Coupons</h2>
          <p className="text-soil/60">Manage discount codes</p>
        </Link>

        <Link href="/admin/custom-orders" className="card p-6 block hover:shadow-md transition-all border border-gray-100 group">
          <h3 className="text-xl font-semibold mb-2 group-hover:text-clay">Custom Orders</h3>
          <p className="text-sm text-gray-600">
            Manage custom requests and quotes
          </p>
          <span className="text-clay mt-2 block">View Requests</span>
        </Link>

        <Link href="/admin/users" className="card p-6 block hover:shadow-md transition-all border border-gray-100 group">
          <h3 className="text-xl font-semibold mb-2 group-hover:text-clay">Users</h3>
          <p className="text-sm text-gray-600">
            Manage user accounts and employees
          </p>
          <span className="text-clay mt-2 block">Manage Users</span>
        </Link>

        <Link href="/admin/featured" className="card p-6 block hover:shadow-md transition-all border border-gray-100 group">
          <h3 className="text-xl font-semibold mb-2 group-hover:text-clay">Featured Collection</h3>
          <p className="text-sm text-gray-600">
            Control homepage featured items
          </p>
        </Link>

        <Link href="/admin/frames" className="card p-6 block hover:shadow-md transition-all border border-gray-100 group">
          <h3 className="text-xl font-semibold mb-2 group-hover:text-clay">Frames</h3>
          <p className="text-sm text-gray-600">
            Edit photo frames section
          </p>
        </Link>

        <Link href="/admin/contact" className="card p-6 block hover:shadow-md transition-all border border-gray-100 group">
          <h3 className="text-xl font-semibold mb-2 group-hover:text-clay">Company Details</h3>
          <p className="text-sm text-gray-600 mb-4">Edit studio name, contact info, visiting hours and policies</p>
          <span className="text-clay">Edit Company Details</span>
        </Link>

        <Link href="/admin/user-contacts" className="card p-6 block hover:shadow-md transition-all border border-gray-100 group">
          <h3 className="text-xl font-semibold mb-2 group-hover:text-clay">User Contacts</h3>
          <p className="text-sm text-gray-600 mb-4">View and manage customer contact messages</p>
          <span className="text-clay">View Messages</span>
        </Link>
      </div>
    </div>
  );
}
