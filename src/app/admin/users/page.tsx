import { requireMainAdmin } from "@/lib/admin-guard";
import AdminUsersClient from "./AdminUsersClient";

export default async function Page() {
  try {
    await requireMainAdmin();
    return <AdminUsersClient />;
  } catch (err: any) {
    const message = err?.message || 'Unauthorized';
    return (
      <div className="p-8">
        <h1 className="text-2xl font-semibold mb-4">Access restricted</h1>
        <p className="text-red-600 mb-2">{message}</p>
        <p className="text-sm text-gray-600">
          If this says <code>MAIN_ADMIN_EMAIL not configured</code>, set the env var and restart the server. To use this page, ensure the main admin email matches an existing user with the <code>admin</code> role.
        </p>
      </div>
    );
  }
}