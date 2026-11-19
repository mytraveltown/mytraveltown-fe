import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, Plus, Pencil, Trash2, HelpCircle } from "lucide-react";
import { GET, POST, PUT, DELETE } from "@/lib/request";
import { API } from "@/lib/endpoints";
import type { FaqInterface, FaqPage } from "@/lib/interface";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { NativeSelect } from "@/components/NativeSelect";

const PAGE_OPTIONS: { value: FaqPage; label: string }[] = [
  { value: "about", label: "About" },
  { value: "contact", label: "Contact" },
  { value: "become_agent", label: "Become Agent" },
];

const emptyForm = (): FormState => ({
  page: "about",
  question: "",
  answer: "",
  sort_order: 0,
  is_active: true,
});

type FormState = {
  page: FaqPage;
  question: string;
  answer: string;
  sort_order: number;
  is_active: boolean;
};

export default function AdminFaqs() {
  const [faqs, setFaqs] = useState<FaqInterface[]>([]);
  const [filterPage, setFilterPage] = useState<FaqPage | "all">("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchFaqs = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const params = filterPage === "all" ? {} : { page: filterPage };
      const data = await GET<FaqInterface[]>(API.FAQ.GET_ALL, params);
      setFaqs(data);
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: string }).message)
          : "Failed to load FAQs";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [filterPage]);

  useEffect(() => {
    fetchFaqs();
  }, [fetchFaqs]);

  const grouped = useMemo(() => {
    const map: Record<FaqPage, FaqInterface[]> = {
      about: [],
      contact: [],
      become_agent: [],
    };
    faqs.forEach((f) => map[f.page].push(f));
    return map;
  }, [faqs]);

  const openCreate = (page: FaqPage = "about") => {
    setEditingId(null);
    setFormError("");
    setForm({ ...emptyForm(), page, sort_order: (grouped[page]?.length ?? 0) + 1 });
    setModalOpen(true);
  };

  const openEdit = (faq: FaqInterface) => {
    setEditingId(faq.id);
    setFormError("");
    setForm({
      page: faq.page,
      question: faq.question,
      answer: faq.answer,
      sort_order: faq.sort_order,
      is_active: faq.is_active,
    });
    setModalOpen(true);
  };

  const closeForm = () => {
    setModalOpen(false);
    setEditingId(null);
    setFormError("");
    setForm(emptyForm());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.question.trim() || !form.answer.trim()) {
      setFormError("Question and answer are required");
      return;
    }

    setIsSaving(true);
    setFormError("");
    try {
      if (editingId) {
        await PUT(API.FAQ.UPDATE(editingId), form);
      } else {
        await POST(API.FAQ.CREATE, form);
      }
      closeForm();
      fetchFaqs();
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: string }).message)
          : "Failed to save FAQ";
      setFormError(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this FAQ?")) return;

    setDeletingId(id);
    try {
      await DELETE(API.FAQ.DELETE(id));
      setFaqs((prev) => prev.filter((f) => f.id !== id));
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: string }).message)
          : "Failed to delete FAQ";
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
            {/* <HelpCircle className="icon-heading text-blue-600" /> */}
            Manage FAQs
          </h2>
          <p className="text-body-sm text-neutral-500">
            Add and edit FAQs shown on About, Contact, and Become Agent pages.
          </p>
        </div>
        <button
          type="button"
          onClick={() => openCreate(filterPage === "all" ? "about" : filterPage)}
          className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white fw-semibold px-4 py-2.5 rounded-lg text-body-sm"
        >
          <Plus size={16} /> Add FAQ
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        <FilterChip active={filterPage === "all"} onClick={() => setFilterPage("all")} label="All pages" />
        {PAGE_OPTIONS.map((p) => (
          <FilterChip
            key={p.value}
            active={filterPage === p.value}
            onClick={() => setFilterPage(p.value)}
            label={p.label}
          />
        ))}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-body-sm">
          {error}
        </div>
      )}

      <Dialog open={modalOpen} onOpenChange={(open) => !open && closeForm()}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto sm:rounded-2xl">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit FAQ" : "New FAQ"}</DialogTitle>
            <DialogDescription>
              {editingId
                ? "Update this question and answer."
                : "Add a new FAQ to About, Contact, or Become Agent pages."}
            </DialogDescription>
          </DialogHeader>

          <form id="faq-form" onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Page">
                <NativeSelect
                  value={form.page}
                  onChange={(e) => setForm((f) => ({ ...f, page: e.target.value as FaqPage }))}
                  className={inputClass}
                >
                  {PAGE_OPTIONS.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </NativeSelect>
              </Field>
              <Field label="Sort order">
                <input
                  type="number"
                  min={0}
                  value={form.sort_order}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, sort_order: Number(e.target.value) || 0 }))
                  }
                  className={inputClass}
                />
              </Field>
            </div>
            <Field label="Question">
              <input
                value={form.question}
                onChange={(e) => setForm((f) => ({ ...f, question: e.target.value }))}
                className={inputClass}
                placeholder="Enter the question"
                required
              />
            </Field>
            <Field label="Answer">
              <textarea
                value={form.answer}
                onChange={(e) => setForm((f) => ({ ...f, answer: e.target.value }))}
                className={`${inputClass} min-h-[120px] resize-y`}
                placeholder="Enter the answer"
                required
              />
            </Field>
            <label className="flex items-center gap-2 text-body-sm cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
                className="h-4 w-4 accent-blue-600"
              />
              Active (visible on site)
            </label>

            {formError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-body-sm">
                {formError}
              </div>
            )}
          </form>

          <DialogFooter className="gap-2 sm:gap-0">
            <button
              type="button"
              onClick={closeForm}
              className="px-4 py-2.5 rounded-lg border border-neutral-200 text-body-sm fw-medium hover:bg-neutral-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="faq-form"
              disabled={isSaving}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white fw-semibold px-4 py-2.5 rounded-lg text-body-sm disabled:opacity-50"
            >
              {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
              {editingId ? "Save changes" : "Create FAQ"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : faqs.length === 0 ? (
        <div className="bg-white border border-neutral-200 rounded-2xl p-12 text-center text-neutral-500">
          No FAQs yet. Click &quot;Add FAQ&quot; to create one.
        </div>
      ) : filterPage === "all" ? (
        PAGE_OPTIONS.map((p) =>
          grouped[p.value].length > 0 ? (
            <FaqGroup
              key={p.value}
              title={p.label}
              faqs={grouped[p.value]}
              onEdit={openEdit}
              onDelete={handleDelete}
              deletingId={deletingId}
              onAdd={() => openCreate(p.value)}
            />
          ) : null
        )
      ) : (
        <FaqGroup
          title={PAGE_OPTIONS.find((p) => p.value === filterPage)?.label ?? ""}
          faqs={faqs}
          onEdit={openEdit}
          onDelete={handleDelete}
          deletingId={deletingId}
          onAdd={() => openCreate(filterPage as FaqPage)}
        />
      )}
    </div>
  );
}

function FaqGroup({
  title,
  faqs,
  onEdit,
  onDelete,
  deletingId,
  onAdd,
}: {
  title: string;
  faqs: FaqInterface[];
  onEdit: (faq: FaqInterface) => void;
  onDelete: (id: number) => void;
  deletingId: number | null;
  onAdd: () => void;
}) {
  return (
    <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100 bg-neutral-50">
        <h2 className="fw-semibold">{title}</h2>
        <button
          type="button"
          onClick={onAdd}
          className="text-body-sm text-blue-600 fw-medium hover:underline"
        >
          + Add to {title}
        </button>
      </div>
      <div className="divide-y divide-neutral-100">
        {faqs.map((faq) => (
          <div key={faq.id} className="px-5 py-4 flex gap-4 items-start">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="fw-medium text-body-sm">{faq.question}</p>
                {!faq.is_active && (
                  <span className="text-caption uppercase fw-bold px-2 py-0.5 rounded-full bg-neutral-200 text-neutral-600">
                    Hidden
                  </span>
                )}
                <span className="text-caption text-neutral-400">Order: {faq.sort_order}</span>
              </div>
              <p className="text-body-sm text-neutral-500 mt-1 line-clamp-2">{faq.answer}</p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => onEdit(faq)}
                className="p-2 rounded-lg hover:bg-neutral-100 text-neutral-600"
                aria-label="Edit"
              >
                <Pencil size={16} />
              </button>
              <button
                type="button"
                onClick={() => onDelete(faq.id)}
                disabled={deletingId === faq.id}
                className="p-2 rounded-lg hover:bg-red-50 text-red-600 disabled:opacity-50"
                aria-label="Delete"
              >
                {deletingId === faq.id ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Trash2 size={16} />
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-body-sm fw-medium border transition ${
 active
 ? "bg-blue-600 text-white border-blue-600"
 : "bg-white text-neutral-600 border-neutral-200 hover:border-blue-300"
 }`}
    >
      {label}
    </button>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-body-sm fw-semibold text-neutral-700 mb-1.5">{label}</label>
      {children}
    </div>
  );
}

const inputClass =
  "w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-body-sm focus:outline-none focus:border-blue-500";
