"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Loader2,
  Trash2,
  Edit2,
  Search,
  UserPlus,
  ChevronLeft,
  ChevronRight,
  X,
  Save,
  ArrowLeft,
} from "lucide-react";
import AdminPageContainer from "@/components/admin/AdminPageContainer";

interface UserItem {
  _id: string;
  name: string;
  email: string;
  role: string;
  isBlocked?: boolean;
  blockedUntil?: string;
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
  const [roleSel, setRoleSel] = useState("customer");

  useEffect(() => {
    fetchUsers();
  }, [page, search, role]);

  const fetchUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      params.append("page", String(page));
      params.append("limit", String(limit));
      if (search) params.append("search", search);
      if (role && role !== "all") params.append("role", role); // Only append if not 'all'

      const res = await fetch(`/api/admin/users?${params.toString()}`, {
        credentials: "same-origin",
      });
      if (!res.ok)
        throw new Error((await res.json()).error || "Failed to fetch");
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
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ name, email, password, role: roleSel }),
      });
      if (!res.ok)
        throw new Error((await res.json()).error || "Failed to create");
      setShowAdd(false);
      setName("");
      setEmail("");
      setPassword("");
      setRoleSel("customer");
      fetchUsers();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const startEdit = (u: UserItem) => {
    setShowEdit(u);
  };

  const submitEdit = async (
    u: UserItem,
    newName: string,
    newEmail: string,
    newRole: string
  ) => {
    setError("");
    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          id: u._id,
          name: newName,
          email: newEmail,
          role: newRole,
        }),
      });
      if (!res.ok)
        throw new Error((await res.json()).error || "Failed to update");
      setShowEdit(null);
      fetchUsers();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const deleteUser = async (id: string) => {
    if (!confirm("Delete this user?")) return;
    setError("");
    try {
      const res = await fetch(`/api/admin/users?id=${id}`, {
        method: "DELETE",
        credentials: "same-origin",
      });
      if (!res.ok) throw new Error((await res.json()).error || "Failed");
      fetchUsers();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const cleanupUnverified = async () => {
    if (
      !confirm(
        "Are you sure? This will delete ALL users who have not verified their email."
      )
    )
      return;
    setError("");
    try {
      const res = await fetch("/api/admin/users/cleanup", {
        method: "DELETE",
        credentials: "same-origin",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      alert(data.message);
      fetchUsers();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const toggleBlock = async (u: UserItem) => {
    setError("");
    // If not blocked, we block forever. If blocked, we unblock.
    const shouldBlock = !u.isBlocked;

    // Optimistic UI update/Loading state could be better, but we'll specific wait for API.
    if (!confirm(shouldBlock ? `Are you sure you want to block ${u.name}?` : `Unblock ${u.name}?`)) return;

    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          id: u._id,
          isBlocked: shouldBlock,
          blockedUntil: null, // Always permanent/manual unblock
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Failed");
      fetchUsers();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <AdminPageContainer title="User Management">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by name or email"
            className="bg-sand/10 focus:bg-white/10 border border-soil/10 focus:border-clay/50 rounded-xl px-4 py-3 outline-none transition-all w-full md:w-auto flex-1 text-base md:text-sm text-soil shadow-sm placeholder:text-soil/30"
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="bg-sand/10 focus:bg-white/10 border border-soil/10 focus:border-clay/50 rounded-xl px-4 py-3 outline-none transition-all w-full md:w-auto text-base md:text-sm text-soil shadow-sm"
          >
            <option value="all">All Roles</option>
            <option value="customer">Customer</option>
            <option value="admin">Admin</option>
          </select>
          <button
            onClick={() => {
              setPage(1);
              fetchUsers();
            }}
            className="bg-clay text-white px-6 py-2 rounded-lg w-full md:w-auto hover:bg-clay/90 transition-colors shadow-md font-medium"
          >
            Search
          </button>
          <div className="ml-auto w-full md:w-auto">
            <button
              onClick={() => setShowAdd(true)}
              className="bg-green-600 text-white px-6 py-2 rounded-lg w-full md:w-auto hover:bg-green-700 transition-colors shadow-md font-medium"
            >
              Add User
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 rounded-lg">
            {error}
          </div>
        )}

        {loading ? (
          <div className="p-8 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 text-center">
            <Loader2 className="animate-spin mx-auto text-clay" />
          </div>
        ) : users.length === 0 ? (
          <div className="p-8 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 text-center text-soil/60">
            No users found
          </div>
        ) : (
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-sm overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-sand/20 backdrop-blur-md border-b border-soil/10 text-soil/50 uppercase tracking-wider text-[10px] font-bold">
                <tr>
                  <th className="p-4 text-xs font-bold uppercase tracking-wider">
                    Name
                  </th>
                  <th className="p-4 text-xs font-bold uppercase tracking-wider">
                    Email
                  </th>
                  <th className="p-4 text-xs font-bold uppercase tracking-wider">
                    Role
                  </th>
                  <th className="p-4 text-xs font-bold uppercase tracking-wider">
                    Status
                  </th>
                  <th className="p-4 text-xs font-bold uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="p-4 text-xs font-bold uppercase tracking-wider text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-soil/5">
                {users.map((u) => (
                  <tr
                    key={u._id}
                    className="border-t hover:bg-amber-50/10 transition-colors"
                  >
                    <td className="p-3 align-top text-sm font-medium text-soil">
                      {u.name}
                    </td>
                    <td className="p-3 align-top text-sm text-soil/60 break-all">
                      {u.email}
                    </td>
                    <td className="p-3 align-top text-sm">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${u.role === "admin"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-blue-100 text-blue-700"
                          }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3 align-top text-sm">
                      {u.isBlocked ? (
                        <div className="flex flex-col">
                          <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase w-fit">
                            Blocked
                          </span>
                          {u.blockedUntil && (
                            <span className="text-[9px] text-red-400 mt-1">
                              Until:{" "}
                              {new Date(u.blockedUntil).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="align-top p-3 text-sm text-soil/40">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="align-top p-3 text-right flex items-center justify-end gap-1">
                      <button
                        onClick={() => startEdit(u)}
                        className="p-2 text-clay hover:bg-sand/20 rounded-lg transition-colors"
                        title="Edit User"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => toggleBlock(u)}
                        className={`p-2 rounded-lg transition-colors ${u.isBlocked
                          ? "text-green-600 hover:bg-green-50"
                          : "text-orange-600 hover:bg-orange-50"
                          }`}
                        title={u.isBlocked ? "Unblock User" : "Block User"}
                      >
                        <X size={18} />
                      </button>
                      <button
                        onClick={() => deleteUser(u._id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete User"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="p-4 flex items-center justify-between">
              <div>Total accounts: {total}</div>
              <div className="flex items-center gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1 border rounded inline-flex items-center gap-1 disabled:opacity-50"
                >
                  <ChevronLeft size={16} /> Prev
                </button>
                <div>Page {page}</div>
                <button
                  disabled={page * limit >= total}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-3 py-1 border rounded inline-flex items-center gap-1 disabled:opacity-50"
                >
                  Next <ChevronRight size={16} />
                </button>
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
                <button
                  onClick={() => setShowAdd(false)}
                  className="text-sm text-clay underline"
                >
                  Close
                </button>
              </div>

              <div className="mt-4 space-y-3">
                <div>
                  <label className="text-sm text-soil/60">Name</label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input-field w-full px-3 py-2 rounded-md text-base md:text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm text-soil/60">Email</label>
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-field w-full px-3 py-2 rounded-md text-base md:text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm text-soil/60">Password</label>
                  <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type="password"
                    className="input-field w-full px-3 py-2 rounded-md text-base md:text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm text-soil/60">Role</label>
                  <select
                    value={roleSel}
                    onChange={(e) => setRoleSel(e.target.value)}
                    className="input-field w-full px-3 py-2 rounded-md text-base md:text-sm"
                  >
                    <option value="admin">Admin</option>
                    <option value="customer">Customer</option>
                  </select>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={addUser}
                    className="px-4 py-2 bg-clay text-white rounded"
                  >
                    Create
                  </button>
                  <button
                    onClick={() => setShowAdd(false)}
                    className="px-4 py-2 border rounded"
                  >
                    Cancel
                  </button>
                </div>
              </div>

              {error && <div className="mt-4 text-red-600">{error}</div>}
            </div>
          </div>
        )}

        {/* Edit modal */}
        {showEdit && (
          <EditModal
            user={showEdit}
            onClose={() => setShowEdit(null)}
            onSave={submitEdit}
          />
        )}


      </div>
    </AdminPageContainer>
  );
}

function EditModal({
  user,
  onClose,
  onSave,
}: {
  user: UserItem;
  onClose: () => void;
  onSave: (
    u: UserItem,
    name: string,
    email: string,
    role: string
  ) => Promise<void>;
}) {
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
      setErr(e.message || "Failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-lg w-full p-6">
        <div className="flex items-start justify-between">
          <h3 className="text-xl font-semibold">Edit {user.name}</h3>
          <button onClick={onClose} className="text-sm text-clay underline">
            Close
          </button>
        </div>

        <div className="mt-4 space-y-3">
          <div>
            <label className="text-sm text-soil/60">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field w-full px-3 py-2 rounded-md text-base md:text-sm"
            />
          </div>
          <div>
            <label className="text-sm text-soil/60">Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field w-full px-3 py-2 rounded-md text-base md:text-sm"
            />
          </div>
          <div>
            <label className="text-sm text-soil/60">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="input-field w-full px-3 py-2 rounded-md text-base md:text-sm"
            >
              <option value="admin">Admin</option>
              <option value="customer">Customer</option>
            </select>
          </div>

          <div className="flex items-center gap-3">
            <button
              disabled={saving}
              onClick={save}
              className="px-4 py-2 bg-clay text-white rounded"
            >
              Save
            </button>
            <button onClick={onClose} className="px-4 py-2 border rounded">
              Cancel
            </button>
          </div>
        </div>

        {err && <div className="mt-4 text-red-600">{err}</div>}
      </div>
    </div>
  );
}
