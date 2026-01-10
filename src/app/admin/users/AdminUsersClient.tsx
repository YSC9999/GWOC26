"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, Trash2, Edit2 } from "lucide-react";

interface UserItem {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("all");
  const [error, setError] = useState("");

  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState<UserItem | null>(null);

  // add form
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [roleSel, setRoleSel] = useState("employee");

  useEffect(() => {
    fetchUsers();
  }, [page, search, role]);

  const fetchUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      params.append('page', String(page));
      params.append('limit', String(limit));
      if (search) params.append('search', search);
      if (role) params.append('role', role);

      const res = await fetch(`/api/admin/users?${params.toString()}`, { credentials: 'same-origin' });
      if (!res.ok) throw new Error((await res.json()).error || 'Failed to fetch');
      const data = await res.json();
      setUsers(data.users || []);
      setTotal(data.pagination?.total || 0);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addUser = async () => {
    setError("");
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ name, email, password, role: roleSel })
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Failed to create');
      setShowAdd(false);
      setName(''); setEmail(''); setPassword(''); setRoleSel('employee');
      fetchUsers();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const startEdit = (u: UserItem) => {
    setShowEdit(u);
  };

  const submitEdit = async (u: UserItem, newName: string, newEmail: string, newRole: string) => {
    setError("");
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ id: u._id, name: newName, email: newEmail, role: newRole })
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Failed to update');
      setShowEdit(null);
      fetchUsers();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const deleteUser = async (id: string) => {
    if (!confirm('Delete this user?')) return;
    setError("");
    try {
      const res = await fetch(`/api/admin/users?id=${id}`, { method: 'DELETE', credentials: 'same-origin' });
      if (!res.ok) throw new Error((await res.json()).error || 'Failed');
      fetchUsers();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin" className="text-soil/60 hover:text-clay">← Admin Home</Link>
        <h1 className="text-3xl font-serif font-bold text-soil">User Management</h1>
      </div>

      <div className="mb-6 flex items-center gap-3">
        <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search by name or email" className="input-field px-3 py-2 rounded-md" />
        <select value={role} onChange={(e) => setRole(e.target.value)} className="input-field px-3 py-2 rounded-md">
          <option value="all">All</option>
          <option value="customer">Customer</option>
          <option value="employee">Employee</option>
          <option value="admin">Admin</option>
        </select>
        <button onClick={() => { setPage(1); fetchUsers(); }} className="bg-clay text-white px-4 py-2 rounded-md">Search</button>
        <div className="ml-auto">
          <button onClick={() => setShowAdd(true)} className="bg-green-600 text-white px-4 py-2 rounded">Add User</button>
        </div>
      </div>

      {error && <div className="mb-4 text-red-600">{error}</div>}

      {loading ? (
        <div className="p-8 bg-white rounded text-center"><Loader2 className="animate-spin mx-auto" /></div>
      ) : users.length === 0 ? (
        <div className="p-8 bg-white rounded text-center">No users found</div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-sand/40">
              <tr>
                <th className="p-3">Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Role</th>
                <th className="p-3">Joined</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} className="border-t">
                  <td className="p-3 align-top text-sm text-soil/60">{u.name}</td>
                  <td className="p-3 align-top text-sm text-soil/60 break-all">{u.email}</td>
                  <td className="p-3 align-top text-sm text-soil/60">{u.role}</td>
                  <td className="align-top p-3 text-sm text-soil/60">{new Date(u.createdAt).toLocaleString()}</td>
                  <td className="align-top p-3 text-right">
                    <button onClick={() => startEdit(u)} className="text-clay px-2 py-1 rounded"><Edit2 /></button>
                    <button onClick={() => deleteUser(u._id)} className="text-red-600 px-2 py-1 rounded ml-2"><Trash2 /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="p-4 flex items-center justify-between">
            <div>Total accounts: {total}</div>
            <div className="flex items-center gap-2">
              <button disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="px-3 py-1 border rounded">Prev</button>
              <div>Page {page}</div>
              <button disabled={page * limit >= total} onClick={() => setPage((p) => p + 1)} className="px-3 py-1 border rounded">Next</button>
            </div>
          </div>
        </div>
      )}

      {/* Add modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-lg w-full p-6">
            <div className="flex items-start justify-between">
              <h3 className="text-xl font-semibold">Add User</h3>
              <button onClick={() => setShowAdd(false)} className="text-sm text-clay underline">Close</button>
            </div>

            <div className="mt-4 space-y-3">
              <div>
                <label className="text-sm text-soil/60">Name</label>
                <input value={name} onChange={(e) => setName(e.target.value)} className="input-field w-full px-3 py-2 rounded-md" />
              </div>
              <div>
                <label className="text-sm text-soil/60">Email</label>
                <input value={email} onChange={(e) => setEmail(e.target.value)} className="input-field w-full px-3 py-2 rounded-md" />
              </div>
              <div>
                <label className="text-sm text-soil/60">Password</label>
                <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" className="input-field w-full px-3 py-2 rounded-md" />
              </div>
              <div>
                <label className="text-sm text-soil/60">Role</label>
                <select value={roleSel} onChange={(e) => setRoleSel(e.target.value)} className="input-field w-full px-3 py-2 rounded-md">
                  <option value="employee">Employee</option>
                  <option value="admin">Admin</option>
                  <option value="customer">Customer</option>
                </select>
              </div>

              <div className="flex items-center gap-3">
                <button onClick={addUser} className="px-4 py-2 bg-clay text-white rounded">Create</button>
                <button onClick={() => setShowAdd(false)} className="px-4 py-2 border rounded">Cancel</button>
              </div>
            </div>

            {error && <div className="mt-4 text-red-600">{error}</div>}
          </div>
        </div>
      )}

      {/* Edit modal */}
      {showEdit && (
        <EditModal user={showEdit} onClose={() => setShowEdit(null)} onSave={submitEdit} />
      )}
    </div>
  );
}

function EditModal({ user, onClose, onSave }: { user: UserItem; onClose: () => void; onSave: (u: UserItem, name: string, email: string, role: string) => Promise<void> }) {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [role, setRole] = useState(user.role);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const save = async () => {
    setErr("");
    setSaving(true);
    try {
      await onSave(user, name, email, role);
    } catch (e: any) {
      setErr(e.message || 'Failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-lg w-full p-6">
        <div className="flex items-start justify-between">
          <h3 className="text-xl font-semibold">Edit {user.name}</h3>
          <button onClick={onClose} className="text-sm text-clay underline">Close</button>
        </div>

        <div className="mt-4 space-y-3">
          <div>
            <label className="text-sm text-soil/60">Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="input-field w-full px-3 py-2 rounded-md" />
          </div>
          <div>
            <label className="text-sm text-soil/60">Email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} className="input-field w-full px-3 py-2 rounded-md" />
          </div>
          <div>
            <label className="text-sm text-soil/60">Role</label>
            <select value={role} onChange={(e) => setRole(e.target.value)} className="input-field w-full px-3 py-2 rounded-md">
              <option value="employee">Employee</option>
              <option value="admin">Admin</option>
              <option value="customer">Customer</option>
            </select>
          </div>

          <div className="flex items-center gap-3">
            <button disabled={saving} onClick={save} className="px-4 py-2 bg-clay text-white rounded">Save</button>
            <button onClick={onClose} className="px-4 py-2 border rounded">Cancel</button>
          </div>
        </div>

        {err && <div className="mt-4 text-red-600">{err}</div>}
      </div>
    </div>
  );
}