import { useCallback, useEffect, useState } from "react";
import {
  Loader2,
  Search,
  Trash2,
  UserCheck,
  Eye,
  CheckCircle2,
  XCircle,
  ExternalLink,
  ShieldCheck,
  BellRing,
} from "lucide-react";
import { toast } from "sonner";
import { GET, POST, PUT, DELETE } from "@/lib/request";
import { API } from "@/lib/endpoints";
import { profileUrl, agentHasCompany } from "@/lib/utils";
import { BANK_DOCUMENT_TYPES, COMPANY_DOCUMENT_TYPES, documentTypeLabel } from "@/lib/documentTypes";
import type {
  AgentInterface,
  AgentReminderSummary,
  ApiResponse,
  DigiLockerData,
  PaginatedResponse,
} from "@/lib/interface";
import { AdminPagination } from "@/components/admin/AdminPagination";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { NativeSelect } from "@/components/NativeSelect";

const STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "pending", label: "Pending" },
  { value: "verified", label: "Verified" },
  { value: "rejected", label: "Rejected" },
];

const REMINDER_TIMEOUT_MS = 120_000;

const statusStyle: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700",
  verified: "bg-green-50 text-green-700",
  rejected: "bg-red-50 text-red-700",
};
export default function AdminAgents() {
  const [agents, setAgents] = useState<AgentInterface[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<AgentInterface | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [reminderOpen, setReminderOpen] = useState(false);
  const [sendingReminders, setSendingReminders] = useState(false);

  const fetchAgents = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const result = await GET<PaginatedResponse<AgentInterface>>(API.AGENT.GET_MANAGE, {
        page: pagination.page,
        limit: pagination.limit,
        ...(search && { q: search }),
        ...(statusFilter && { verification_status: statusFilter }),
      });
      setAgents(result.data);
      setPagination(result.pagination);
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: string }).message)
          : "Failed to load agents";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [pagination.page, pagination.limit, search, statusFilter]);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  const applySearch = () => {
    setPagination((p) => ({ ...p, page: 1 }));
    setSearch(searchInput.trim());
  };

  const updateVerification = async (status: "verified" | "rejected" | "pending") => {
    if (!selected) return;

    setVerifying(true);
    try {
      const updated = await PUT<AgentInterface>(API.AGENT.VERIFY(selected.id), {
        verification_status: status,
      });
      setAgents((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
      setSelected(null);
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: string }).message)
          : "Failed to update verification";
      alert(message);
    } finally {
      setVerifying(false);
    }
  };

  const handleDelete = async (agent: AgentInterface) => {
    const label = agentHasCompany(agent) ? agent.company_name : agent.user_name;
    if (
      !window.confirm(
        `Remove agent "${label}"? Their account will become a regular user and all their packages will be deleted.`
      )
    ) {
      return;
    }

    setDeletingId(agent.id);
    try {
      await DELETE(API.AGENT.DELETE(agent.id));
      setAgents((prev) => prev.filter((a) => a.id !== agent.id));
      setPagination((p) => ({ ...p, total: Math.max(0, p.total - 1) }));
      if (selected?.id === agent.id) setSelected(null);
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: string }).message)
          : "Failed to remove agent";
      alert(message);
    } finally {
      setDeletingId(null);
    }
  };

  const sendPackageReminders = async () => {
    setSendingReminders(true);
    try {
      // Sending many emails can exceed the default 15s API timeout.
      const result = await POST<ApiResponse<AgentReminderSummary>>(
        API.AGENT.SEND_PACKAGE_REMINDERS,
        {},
        { timeout: REMINDER_TIMEOUT_MS }
      );
      console.log("[Agent reminder] Response:", result);
      const { email, sms } = result.data;
      toast.success(result.message);
      if (email.failed > 0 || sms.failed > 0) {
        toast.warning(
          `${email.failed} email and ${sms.failed} SMS reminders failed.${sms.error ? ` SMS: ${sms.error}` : ""}`
        );
      }
      setReminderOpen(false);
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: string }).message)
          : "Failed to send reminders";
      console.error("[Agent reminder] Request failed:", err);
      toast.error(message);
    } finally {
      setSendingReminders(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h2 className="fw-bold flex items-center gap-3">
            {/* <UserCheck className="icon-heading text-blue-600" /> */}
            Agents
          </h2>
          <p className="text-body-sm text-neutral-500">
            Manage agents and verify uploaded documents.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setReminderOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-blue-200 bg-blue-50 text-blue-700 text-body-sm fw-semibold hover:bg-blue-100"
        >
          <BellRing className="h-4 w-4" />
          Send package reminder
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && applySearch()}
            placeholder="Search company, location, name, email..."
            className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-neutral-200 text-body-sm focus:outline-none focus:border-blue-500"
          />
        </div>
        <NativeSelect
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPagination((p) => ({ ...p, page: 1 }));
          }}
          className="border border-neutral-200 rounded-lg px-3 py-2.5 text-body-sm focus:outline-none focus:border-blue-500"
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value || "all"} value={o.value}>
              {o.label}
            </option>
          ))}
        </NativeSelect>
        <button
          type="button"
          onClick={applySearch}
          className="px-4 py-2.5 rounded-lg bg-blue-600 text-white text-body-sm fw-semibold hover:bg-blue-700"
        >
          Search
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-body-sm">
          {error}
        </div>
      )}

      <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : agents.length === 0 ? (
          <div className="p-12 text-center text-neutral-500">No agents found.</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-body-sm min-w-[900px]">
                <thead>
                  <tr className="text-left text-neutral-500 border-b border-neutral-200 bg-neutral-50">
                    <th className="py-3 px-5 fw-medium">Agent</th>
                    <th className="py-3 px-5 fw-medium">Company</th>
                    <th className="py-3 px-5 fw-medium">Location</th>
                    <th className="py-3 px-5 fw-medium">Experience</th>
                    <th className="py-3 px-5 fw-medium">Verification</th>
                    <th className="py-3 px-5 fw-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {agents.map((agent) => (
                    <tr
                      key={agent.id}
                      className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50/80"
                    >
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <img
                            src={profileUrl(agent.user_profile || "")}
                            alt={agent.user_name || agent.company_name}
                            className="h-9 w-9 rounded-full object-cover bg-neutral-100"
                          />
                          <div>
                            <p className="fw-medium">{agent.user_name}</p>
                            <p className="text-caption text-neutral-500">{agent.user_phone}</p>
                            <p className="text-caption text-neutral-500">{agent.user_email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-5">
                        {agentHasCompany(agent) ? (
                          <div>
                            <p className="fw-medium">{agent.company_name}</p>
                            {agent.company_document_type && (
                              <p className="text-caption text-neutral-500 mt-0.5">
                                Document: {documentTypeLabel(COMPANY_DOCUMENT_TYPES, agent.company_document_type)}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="text-neutral-400 italic">No company</span>
                        )}
                      </td>
                      <td className="py-4 px-5 text-neutral-600">{agent.location}</td>
                      <td className="py-4 px-5 text-neutral-600">{agent.experience} yrs</td>
                      <td className="py-4 px-5">
                        <span
                          className={`text-caption fw-semibold px-2 py-1 rounded-full capitalize ${statusStyle[agent.verification_status || "pending"] ||
 statusStyle.pending
 }`}
                        >
                          {agent.verification_status || "pending"}
                        </span>
                      </td>
                      <td className="py-4 px-5 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setSelected(agent)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-200 text-body-sm fw-medium hover:bg-neutral-50"
                          >
                            <Eye className="h-4 w-4" />
                            Review
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(agent)}
                            disabled={deletingId === agent.id}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 text-red-700 text-body-sm fw-medium hover:bg-red-50 disabled:opacity-50"
                          >
                            {deletingId === agent.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                            Remove
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
          </>
        )}
      </div>

      <Dialog
        open={reminderOpen}
        onOpenChange={(open) => !sendingReminders && setReminderOpen(open)}
      >
        <DialogContent className="max-w-md sm:rounded-2xl">
          <DialogHeader>
            <DialogTitle>Send package reminder?</DialogTitle>
            <DialogDescription>
              Every agent who has not created a package yet will be reminded to list one.
              Agents with a mobile number get an SMS, and agents with a real email
              address also get an email.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <button
              type="button"
              onClick={() => setReminderOpen(false)}
              disabled={sendingReminders}
              className="px-4 py-2.5 rounded-lg border border-neutral-200 text-body-sm fw-medium hover:bg-neutral-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={sendPackageReminders}
              disabled={sendingReminders}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 text-white text-body-sm fw-semibold hover:bg-blue-700 disabled:opacity-50"
            >
              {sendingReminders ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <BellRing className="h-4 w-4" />
              )}
              Send reminders
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto sm:rounded-2xl">
          <DialogHeader>
            <DialogTitle>
              {selected && agentHasCompany(selected)
                ? selected.company_name
                : selected?.user_name}
            </DialogTitle>
            <DialogDescription>
              Agent verification — {selected?.user_name} ({selected?.user_email})
            </DialogDescription>
          </DialogHeader>

          {selected && (
            <div className="space-y-5 text-body-sm">
              {agentHasCompany(selected) ? (
                <div>
                  <p className="text-caption fw-semibold text-neutral-500 uppercase mb-2">
                    Company Details
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-neutral-50 rounded-xl p-4 border border-neutral-200">
                    <Info label="Company Name" value={selected.company_name} />
                    <Info
                      label="Document Type"
                      value={documentTypeLabel(COMPANY_DOCUMENT_TYPES, selected.company_document_type)}
                    />
                    {/* Legacy agents registered before the document upload replaced these fields. */}
                    {selected.cin_no && <Info label="CIN No" value={selected.cin_no} />}
                    {selected.gst_no && <Info label="GST No" value={selected.gst_no} />}
                    <div className="sm:col-span-2">
                      <DocumentCard label="Company document" path={selected.company_document} />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-neutral-600">
                  Registered as an individual — no company details provided.
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <Info label="Location" value={selected.location} />
                <Info label="Experience" value={`${selected.experience} years`} />
                <Info
                  label="Method"
                  value={selected.verification_method || "—"}
                  capitalize
                />
                <Info
                  label="Status"
                  value={selected.verification_status || "pending"}
                  capitalize
                />
              </div>

              <div>
                <p className="text-caption fw-semibold text-neutral-500 uppercase mb-2">About</p>
                <p className="text-neutral-700 leading-relaxed bg-neutral-50 rounded-xl p-4 border border-neutral-200">
                  {selected.about}
                </p>
              </div>

              {selected.bank && (
                <div>
                  <p className="text-caption fw-semibold text-neutral-500 uppercase mb-2">
                    Bank Details
                  </p>

                  <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Info
                        label="Account Holder"
                        value={selected.bank.account_holder}
                      />

                      <Info
                        label="Account Number"
                        value={selected.bank.account_name}
                      />

                      <Info
                        label="Bank Name"
                        value={selected.bank.bank_name}
                      />

                      <Info
                        label="IFSC"
                        value={selected.bank.ifsc}
                      />
                    </div>

                    {selected.bank.bank_address && (
                      <Info
                        label="Bank Address"
                        value={selected.bank.bank_address}
                      />
                    )}

                    {selected.bank.bank_document_type && (
                      <Info
                        label="Bank Document Type"
                        value={documentTypeLabel(
                          BANK_DOCUMENT_TYPES,
                          selected.bank.bank_document_type
                        )}
                      />
                    )}
                    <DocumentCard label="Bank document" path={selected.bank.bank_document} />
                    {/* Legacy agents uploaded a cancelled cheque before the bank document replaced it. */}
                    {selected.bank.cancelled_cheque && (
                      <DocumentCard
                        label="Cancelled Cheque"
                        path={selected.bank.cancelled_cheque}
                      />
                    )}
                  </div>
                </div>
              )}

              {selected.verification_method === "digilocker" ? (
                selected.digilocker_data?.aadhaarData ? (
                  <DigiLockerCard data={selected.digilocker_data} />
                ) : (
                  <div className="rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-neutral-600">
                    Verified via DigiLocker — no Aadhaar details available.
                  </div>
                )
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <DocumentCard label="Aadhaar front" path={selected.aadhar_document} />
                  <DocumentCard
                    label="Aadhaar back"
                    path={selected.aadhar_document_back}
                  />
                  <DocumentCard label="Driving licence front" path={selected.dl_document} />
                  <DocumentCard
                    label="Driving licence back"
                    path={selected.dl_document_back}
                  />
                </div>
              )}

              <DialogFooter className="gap-2 sm:gap-0 flex-wrap">
                <button
                  type="button"
                  onClick={() => selected && handleDelete(selected)}
                  disabled={verifying || deletingId === selected?.id}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-red-200 text-red-700 text-body-sm fw-semibold hover:bg-red-50 disabled:opacity-50 mr-auto"
                >
                  {deletingId === selected?.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                  Remove agent
                </button>
                <button
                  type="button"
                  onClick={() => updateVerification("rejected")}
                  disabled={verifying}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-red-200 text-red-700 text-body-sm fw-semibold hover:bg-red-50 disabled:opacity-50"
                >
                  {verifying ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <XCircle className="h-4 w-4" />
                  )}
                  Reject
                </button>
                <button
                  type="button"
                  onClick={() => updateVerification("verified")}
                  disabled={verifying}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-green-600 text-white text-body-sm fw-semibold hover:bg-green-700 disabled:opacity-50"
                >
                  {verifying ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4" />
                  )}
                  Approve
                </button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Info({
  label,
  value,
  capitalize = false,
}: {
  label: string;
  value: string;
  capitalize?: boolean;
}) {
  return (
    <div>
      <p className="text-caption fw-semibold text-neutral-500 uppercase">{label}</p>
      <p className={`text-neutral-800 mt-0.5 ${capitalize ? "capitalize" : ""}`}>{value}</p>
    </div>
  );
}

function DocumentCard({ label, path }: { label: string; path?: string | null }) {
  if (!path) {
    return (
      <div className="rounded-xl border border-dashed border-neutral-200 p-4 text-neutral-400 text-body-sm">
        {label}: Not uploaded
      </div>
    );
  }

  const url = profileUrl(path);
  const isPdf = path.toLowerCase().endsWith(".pdf");

  return (
    <div className="rounded-xl border border-neutral-200 overflow-hidden">
      <div className="px-3 py-2 bg-neutral-50 border-b border-neutral-200 flex items-center justify-between">
        <span className="text-caption fw-semibold text-neutral-600">{label}</span>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-caption text-blue-600 hover:underline"
        >
          Open <ExternalLink className="h-3 w-3" />
        </a>
      </div>
      {isPdf ? (
        <div className="p-6 text-center text-body-sm text-neutral-500 bg-neutral-50">
          PDF document uploaded
        </div>
      ) : (
        <img src={url} alt={label} className="w-full h-40 object-cover bg-neutral-100" />
      )}
    </div>
  );
}

function DigiLockerCard({ data }: { data: DigiLockerData }) {
  const aadhaar = data.aadhaarData || {};
  const rows: { label: string; value?: string | null }[] = [
    { label: "Name", value: aadhaar.name },
    { label: "Date of Birth", value: aadhaar.dateOfBirth },
    { label: "Gender", value: aadhaar.gender },
    { label: "Address", value: aadhaar.address },
    { label: "State", value: aadhaar.state },
    { label: "District", value: aadhaar.district },
    { label: "Pincode", value: aadhaar.pincode },
  ];

  return (
    <div className="rounded-xl border border-green-200 bg-green-50/60 overflow-hidden">
      <div className="px-4 py-3 bg-green-100/70 border-b border-green-200 flex items-center gap-2">
        <ShieldCheck className="h-4 w-4 text-green-700" />
        <span className="text-body-sm fw-semibold text-green-800">
          DigiLocker Verified — Aadhaar Details
        </span>
      </div>
      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {rows.map((row) => (
          <div key={row.label}>
            <p className="text-caption fw-semibold text-neutral-500 uppercase">{row.label}</p>
            <p className="text-neutral-800 mt-0.5">{row.value || "—"}</p>
          </div>
        ))}
      </div>
      {(data.transactionId || data.aadhaarVerificationId) && (
        <div className="px-4 py-2 border-t border-green-200 bg-green-50 text-caption text-neutral-500 space-y-0.5">
          {data.transactionId && <p>Transaction ID: {data.transactionId}</p>}
          {data.aadhaarVerificationId && (
            <p>Aadhaar Verification ID: {data.aadhaarVerificationId}</p>
          )}
        </div>
      )}
    </div>
  );
}
