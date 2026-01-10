export default function AdminDashboard() {
  return (
    <div>
      <h1 className="text-3xl font-serif font-bold text-soil mb-6">
        Admin Home
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6">
          <h3 className="text-xl font-semibold mb-2">Products</h3>
          <p className="text-sm text-gray-600">
            Manage collection items
          </p>
          <a href="/admin/products" className="text-clay underline mt-2 block">Manage Products</a>
        </div>

        <div className="card p-6">
          <h3 className="text-xl font-semibold mb-2">Orders</h3>
          <p className="text-sm text-gray-600">
            View and update customer orders
          </p>
          <a href="/admin/orders" className="text-clay underline mt-2 block">View Orders</a>
        </div>

        <div className="card p-6">
          <h3 className="text-xl font-semibold mb-2">Custom Orders</h3>
          <p className="text-sm text-gray-600">
            Manage custom requests and quotes
          </p>
          <a href="/admin/custom-orders" className="text-clay underline mt-2 block">View Requests</a>
        </div>

        <div className="card p-6">
          <h3 className="text-xl font-semibold mb-2">Featured Collection</h3>
          <p className="text-sm text-gray-600">
            Control homepage featured items
          </p>
        </div>

        <div className="card p-6">
          <h3 className="text-xl font-semibold mb-2">Frames</h3>
          <p className="text-sm text-gray-600">
            Edit photo frames section
          </p>
        </div>

        <div className="card p-6">
          <h3 className="text-xl font-semibold mb-2">Company Details</h3>
          <p className="text-sm text-gray-600 mb-4">Edit studio name, contact info, visiting hours and policies</p>
          <a href="/admin/contact" className="text-clay underline">Edit Company Details</a>
        </div>

        <div className="card p-6">
          <h3 className="text-xl font-semibold mb-2">User Contacts</h3>
          <p className="text-sm text-gray-600 mb-4">View and manage customer contact messages</p>
          <a href="/admin/user-contacts" className="text-clay underline">View Messages</a>
        </div>
      </div>
    </div>
  );
}
