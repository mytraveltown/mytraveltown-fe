import { useCallback, useEffect, useState } from "react";
import {
  Loader2,
  Mail,
  Trash2,
  Eye,
  Phone,
  Calendar,
  User,
  MessageSquare,
} from "lucide-react";
import { GET, DELETE } from "@/lib/request";
import { API } from "@/lib/endpoints";
import { AdminPagination } from "@/components/admin/AdminPagination";
import type {
  ContactInterface,
  PaginatedResponse,
  PaginationMeta,
} from "@/lib/interface";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

function formatDate(value: string) {
  return new Date(value).toLocaleString("en-IN", {
    day:"numeric",
    month: "short",
    year:"numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatPhone(phone: number) {
  return String(phone);
}

export default function AdminContacts() {
  const [contacts, setContacts] = useState<ContactInterface[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [selected, setSelected] = useState<ContactInterface | null>(null);
  const [pagination, setPagination] = useState<PaginationMeta>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  const fetchContacts = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const result = await GET<PaginatedResponse<ContactInterface>>(API.CONTACT.GET_ALL, {
        page: pagination.page,
        limit: pagination.limit,
      });
      setContacts(result.data);
      setPagination(result.pagination);
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: string }).message)
          : "Failed to load contacts";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [pagination.page, pagination.limit]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const handleDelete = async (contact: ContactInterface) => {
    if (!window.confirm(`Delete message from "${contact.name}"?`)) return;

    setDeletingId(contact.id);
    try {
      await DELETE(API.CONTACT.DELETE(contact.id));
      if (selected?.id === contact.id) setSelected(null);
      const isLastOnPage = contacts.length === 1 && pagination.page > 1;
      if (isLastOnPage) setPagination((p) => ({ ...p, page: p.page - 1 }));
      else await fetchContacts();
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: string }).message)
          : "Failed to delete contact";
      alert(message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="fw-bold flex items-center gap-3">
            {/* <Mail className="icon-heading text-blue-600" /> */}
            Contact Messages
          </h2>
          <p className="text-body-sm text-neutral-500">
            View inquiries submitted from the contact page.
          </p>
        </div>
        {!isLoading && (
          <span className="text-body-sm fw-medium text-neutral-600 bg-white border border-neutral-200 px-3 py-1.5 rounded-full">
            {pagination.total} message{pagination.total === 1 ? "" : "s"}
          </span>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-body-sm">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : contacts.length === 0 ? (
        <div className="bg-white border border-neutral-200 rounded-2xl p-12 text-center text-neutral-500">
          No contact messages yet.
        </div>
      ) : (
        <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-body-sm min-w-[720px]">
              <thead>
                <tr className="text-left text-neutral-500 border-b border-neutral-200 bg-neutral-50">
                  <th className="py-3 px-5 fw-medium">Name</th>
                  <th className="py-3 px-5 fw-medium">Phone</th>
                  <th className="py-3 px-5 fw-medium">Subject</th>
                  <th className="py-3 px-5 fw-medium">Message</th>
                  <th className="py-3 px-5 fw-medium">Received</th>
                  <th className="py-3 px-5 fw-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {contacts.map((contact) => (
                  <tr
                    key={contact.id}
                    className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50/80"
                  >
                    <td className="py-4 px-5 fw-medium">{contact.name}</td>
                    <td className="py-4 px-5 text-neutral-600">{formatPhone(contact.phone)}</td>
                    <td className="py-4 px-5 text-neutral-700 max-w-[160px] truncate">
                      {contact.subject}
                    </td>
                    <td className="py-4 px-5 text-neutral-500 max-w-[220px] truncate">
                      {contact.message}
                    </td>
                    <td className="py-4 px-5 text-neutral-500 whitespace-nowrap text-caption">
                      {formatDate(contact.created_at)}
                    </td>
                    <td className="py-4 px-5">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => setSelected(contact)}
                          className="p-2 rounded-lg hover:bg-neutral-100 text-neutral-600"
                          aria-label="View message"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(contact)}
                          disabled={deletingId === contact.id}
                          className="p-2 rounded-lg hover:bg-red-50 text-red-600 disabled:opacity-50"
                          aria-label="Delete message"
                        >
                          {deletingId === contact.id ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <Trash2 size={16} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-5 pb-5">
            <AdminPagination
              pagination={pagination}
              onPageChange={(page) => setPagination((p) => ({ ...p, page }))}
            />
          </div>
        </div>
      )}

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-lg sm:rounded-2xl">
          <DialogHeader>
            <DialogTitle>{selected?.subject}</DialogTitle>
            <DialogDescription>Contact form submission</DialogDescription>
          </DialogHeader>

          {selected && (
            <div className="space-y-4 text-body-sm">
              <DetailRow icon={User} label="Name" value={selected.name} />
              <DetailRow icon={Phone} label="Phone" value={formatPhone(selected.phone)} />
              <DetailRow icon={Calendar} label="Received" value={formatDate(selected.created_at)} />
              <div>
                <div className="flex items-center gap-2 text-neutral-500 mb-2">
                  <MessageSquare className="h-4 w-4" />
                  <span className="fw-semibold text-neutral-700">Message</span>
                </div>
                <p className="text-neutral-700 leading-relaxed bg-neutral-50 border border-neutral-200 rounded-xl p-4 whitespace-pre-wrap">
                  {selected.message}
                </p>
              </div>
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => handleDelete(selected)}
                  disabled={deletingId === selected.id}
                  className="inline-flex items-center gap-2 text-body-sm text-red-600 hover:text-red-700 fw-medium disabled:opacity-50"
                >
                  {deletingId === selected.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                  Delete message
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof User;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="h-4 w-4 text-neutral-400 mt-0.5 shrink-0" />
      <div>
        <p className="text-caption fw-semibold text-neutral-500 uppercase tracking-wide">{label}</p>
        <p className="text-neutral-800 mt-0.5">{value}</p>
      </div>
    </div>
  );
}
