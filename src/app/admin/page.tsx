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
      </div>
    </div>
  );
}
