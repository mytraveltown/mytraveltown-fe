/**
 * Document types offered in the "document type" dropdowns. Placeholder labels for now;
 * rename labels freely. If you add or change a `value`, update the matching list in the
 * backend (src/utils/documentTypes.js) too.
 */
export interface DocumentTypeOption {
  value: string;
  label: string;
}

/**
 * Option value that lets the user type their own document name. The typed name
 * (not this value) is what gets saved.
 */
export const OTHER_DOCUMENT_TYPE = "other";
export const CUSTOM_DOCUMENT_TYPE_MAX_LENGTH = 50;

/** Agent profile: proof of the agent's company. */
export const COMPANY_DOCUMENT_TYPES: readonly DocumentTypeOption[] = [
  { value: "company_pan", label: "Company PAN Card" },
  { value: "company_gst", label: "Company GST" },
  { value: "llpin", label: "LLP Identification Number (LLPIN)" },
  { value: "partnership_registration", label: "Partnership Firm Registration Certificate" },
  { value: "msme_udyam", label: "MSME/Udyam Certificate" },
  { value: OTHER_DOCUMENT_TYPE, label: "Others" },
];

/** Bank details: proof of the payout bank account. */
export const BANK_DOCUMENT_TYPES: readonly DocumentTypeOption[] = [
  { value: "bank_statement", label: "Bank Statement" },
  { value: "cancelled_cheque", label: "Cancelled Cheque" },
];

export function documentTypeLabel(
  options: readonly DocumentTypeOption[],
  value: string | null | undefined
): string {
  return options.find((option) => option.value === value)?.label ?? value ?? "—";
}
