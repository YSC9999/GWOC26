"use client";
import { useEffect, useState } from "react";
import { Loader2, Mail, Trash2, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface Message {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: string;
  createdAt: string;
}

export default function UserContactsAdmin() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<Message | null>(null);
  const [expandFullMessage, setExpandFullMessage] = useState(false);

  const truncateMessage = (text: string, maxWords = 200) => {
    if (!text) return "";
    const words = text.trim().split(/\s+/).filter(Boolean);
    if (words.length <= maxWords) return text;
    return words.slice(0, maxWords).join(" ") + "...";
  };

  useEffect(() => {
    fetchMessages();
  }, [page, search, statusFilter]);

  const fetchMessages = async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      params.append("page", String(page));
      params.append("limit", String(limit));
      if (search) params.append("search", search);
      if (statusFilter) params.append("status", statusFilter);

      const res = await fetch(`/api/admin/contacts?${params.toString()}`, {
        credentials: "same-origin",
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(err.error || res.statusText || "Failed to fetch");
      }

      const data = await res.json();
      setMessages(data.messages || []);
      setTotal(data.pagination?.total || 0);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch("/api/admin/contacts", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ id, status }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Failed");
      const data = await res.json();
      const updated: Message = data.message as Message;
      setMessages((m) => m.map((it) => (it._id === id ? updated : it)));
      // Update modal selected if it's the same message
      setSelected((s) => (s && s._id === id ? updated : s));
    } catch (err: any) {
      setError(err.message);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this message?")) return;
    try {
      const res = await fetch(`/api/admin/contacts?id=${id}`, {
        method: "DELETE",
        credentials: "same-origin",
      });
      if (!res.ok) throw new Error((await res.json()).error || "Failed");
      setMessages((m) => m.filter((it) => it._id !== id));
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin" className="flex items-center gap-2 text-soil/40 hover:text-soil transition-colors font-medium shrink-0">
          <ArrowLeft size={20} />
          <span>Admin</span>
        </Link>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-soil">
          User Contacts
        </h1>
      </div>

      <div className="mb-6 flex flex-col md:flex-row md:items-center gap-3">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, email, subject" className="input-field px-3 py-2 rounded-md w-full md:w-auto flex-1 text-base md:text-sm" />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-field px-3 py-2 rounded-md w-full md:w-auto text-base md:text-sm">
          <option value="all">All</option>
          <option value="new">New</option>
          <option value="read">Read</option>
          <option value="replied">Replied</option>
        </select>
        <button
          onClick={() => {
            setPage(1);
            fetchMessages();
          }}
          className="bg-clay text-white px-4 py-2 rounded-md w-full md:w-auto"
        >
          Search
        </button>
      </div>

      {error && <div className="mb-4 text-red-600">{error}</div>}

      {loading ? (
        <div className="p-8 bg-white rounded text-center">
          <Loader2 className="animate-spin mx-auto" />
        </div>
      ) : messages.length === 0 ? (
        <div className="p-8 bg-white rounded text-center">
          No messages found
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-sand/40">
              <tr>
                <th className="p-3">Status</th>
                <th className="p-3">Email</th>
                <th className="p-3">Phone</th>
                <th className="p-3">Query</th>
                <th className="p-3">Received</th>
                <th className="p-3">&nbsp;</th>
              </tr>
            </thead>
            <tbody>
              {messages.map((m) => (
                <tr key={m._id} className="border-t">
                  {/* Status: two small checkboxes for Read and Replied */}
                  <td className="p-3 align-top flex gap-2">
                    {/* Read */}
                    <button
                      title={
                        m.status === "replied"
                          ? "Replied (implies Read)"
                          : "Mark Read"
                      }
                      onClick={() =>
                        updateStatus(
                          m._id,
                          m.status === "read" ? "new" : "read"
                        )
                      }
                      className={`w-5 h-5 rounded-sm inline-block border flex-shrink-0 ${m.status === "read" || m.status === "replied"
                        ? "bg-yellow-200 border-yellow-300"
                        : "bg-white border-soil/20"
                        }`}
                      aria-pressed={
                        m.status === "read" || m.status === "replied"
                      }
                      aria-label="Toggle Read"
                    />

                    {/* Replied */}
                    <button
                      title={
                        m.status === "replied"
                          ? "Mark Replied (checked)"
                          : "Mark Replied"
                      }
                      onClick={() =>
                        updateStatus(
                          m._id,
                          m.status === "replied" ? "read" : "replied"
                        )
                      }
                      className={`w-5 h-5 rounded-sm inline-block border flex-shrink-0 ${m.status === "replied"
                        ? "bg-green-200 border-green-300"
                        : "bg-white border-soil/20"
                        }`}
                      aria-pressed={m.status === "replied"}
                      aria-label="Toggle Replied"
                    />
                  </td>

                  <td className="p-3 align-top text-sm text-soil/60 break-all">
                    <a
                      href={`mailto:${m.email}`}
                      className="underline text-clay"
                    >
                      {m.email}
                    </a>
                  </td>

                  <td className="p-3 align-top text-sm text-soil/60">
                    {m.phone || "-"}
                  </td>

                  <td
                    className="p-3 align-top"
                    style={{ cursor: "pointer" }}
                    onClick={() => setSelected(m)}
                  >
                    <div className="font-medium text-clay underline">
                      {m.subject || "Query"}
                    </div>
                  </td>

                  <td className="align-top p-3 text-sm text-soil/60">
                    {new Date(m.createdAt).toLocaleString()}
                  </td>

                  <td className="align-top p-3 text-right">
                    <button
                      onClick={() => remove(m._id)}
                      className="text-red-600 px-2 py-1 rounded"
                    >
                      <Trash2 />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="p-4 flex items-center justify-between">
            <div>{messages.length} messages</div>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1 border rounded"
              >
                Prev
              </button>
              <div>Page {page}</div>
              <button
                disabled={page * limit >= total}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1 border rounded"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Details modal */}
      {selected && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[80vh]">
            <div className="flex items-start justify-between sticky top-0 bg-white z-10 pb-4">
              <div className="flex-1">
                <div className="flex items-center gap-4 justify-between">
                  <h3 className="text-xl font-semibold">{selected.subject}</h3>

                  {/* Status indicators in modal - match row checkboxes */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <div
                        className={`w-4 h-4 rounded-sm border ${selected.status === "read" ||
                          selected.status === "replied"
                          ? "bg-yellow-200 border-yellow-300"
                          : "bg-white border-soil/20"
                          }`}
                      />
                      <span className="text-xs text-soil/60">Read</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div
                        className={`w-4 h-4 rounded-sm border ${selected.status === "replied"
                          ? "bg-green-200 border-green-300"
                          : "bg-white border-soil/20"
                          }`}
                      />
                      <span className="text-xs text-soil/60">Replied</span>
                    </div>
                  </div>
                </div>

                <div className="mt-3 bg-sand/20 p-3 rounded">
                  <div className="text-sm text-soil/60">
                    <strong>Name:</strong> {selected.name}
                  </div>
                  <div className="text-sm text-soil/60">
                    <strong>Email:</strong>{" "}
                    <a
                      href={`mailto:${selected.email}`}
                      className="underline text-clay"
                    >
                      {selected.email}
                    </a>
                  </div>
                  <div className="text-sm text-soil/60">
                    <strong>Phone:</strong> {selected.phone || "-"}
                  </div>
                  <div className="text-sm text-soil/60 mt-2">
                    <strong>Received:</strong>{" "}
                    {new Date(selected.createdAt).toLocaleString()}
                  </div>
                  <div className="text-sm text-soil/60">
                    <strong>Status:</strong> {selected.status}
                  </div>
                </div>
              </div>
              <div className="ml-4">
                <button
                  onClick={() => setSelected(null)}
                  className="text-sm text-clay underline"
                >
                  Close
                </button>
              </div>
            </div>

            <div className="mt-4 max-h-[60vh] overflow-y-auto pr-2">
              <h4 className="mt-2 text-sm text-soil/60">Message</h4>
              <div className="mt-2 text-soil/70 whitespace-pre-line">
                {truncateMessage(selected.message, 200)}
              </div>
            </div>

            <div className="mt-4 flex items-center gap-3 sticky bottom-0 bg-white pt-3">
              <button
                onClick={() =>
                  updateStatus(
                    selected._id,
                    selected.status === "read" ? "new" : "read"
                  )
                }
                className="px-4 py-2 bg-white border rounded"
              >
                {selected.status === "read" || selected.status === "replied"
                  ? "Mark Unread"
                  : "Mark Read"}
              </button>
              <button
                onClick={() =>
                  updateStatus(
                    selected._id,
                    selected.status === "replied" ? "read" : "replied"
                  )
                }
                className="px-4 py-2 bg-white border rounded"
              >
                {selected.status === "replied"
                  ? "Unmark Replied"
                  : "Mark Replied"}
              </button>
              <button
                onClick={() => {
                  remove(selected._id);
                  setSelected(null);
                }}
                className="px-4 py-2 bg-red-50 text-red-600 border rounded"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
