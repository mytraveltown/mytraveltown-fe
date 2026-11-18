import { useId, useRef, useState } from "react";
import { FileText, Upload, X } from "lucide-react";
import {
  CUSTOM_DOCUMENT_TYPE_MAX_LENGTH,
  OTHER_DOCUMENT_TYPE,
  type DocumentTypeOption,
} from "@/lib/documentTypes";
import { profileUrl } from "@/lib/utils";

const ACCEPTED_FILES = "image/*,.pdf";

interface DocumentTypeUploadFieldProps {
  /** Label above the dropdown, e.g. "Company Document Type". */
  typeLabel: string;
  /** Label above the upload box, e.g. "Upload Company Document". */
  uploadLabel: string;
  /** Include an option with value OTHER_DOCUMENT_TYPE to let users type their own name. */
  options: readonly DocumentTypeOption[];
  /** Selected option value, or the typed name when "Others" is chosen. */
  documentType: string;
  onDocumentTypeChange: (type: string) => void;
  file: File | null;
  onFileChange: (file: File | null) => void;
  /** Path of the document already on record (edit mode), shown until replaced. */
  existingDocument?: string | null;
  /** Classes for the select, so it matches the host form's inputs. */
  selectClassName: string;
}

/** Document type dropdown plus a single PDF / image upload for that document. */
export function DocumentTypeUploadField({
  typeLabel,
  uploadLabel,
  options,
  documentType,
  onDocumentTypeChange,
  file,
  onFileChange,
  existingDocument,
  selectClassName,
}: DocumentTypeUploadFieldProps) {
  const selectId = useId();
  const customTypeId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  // A saved value that is not a listed option is a custom name typed under "Others".
  const isListedOption = options.some(
    (option) => option.value === documentType && option.value !== OTHER_DOCUMENT_TYPE
  );
  const [otherChosen, setOtherChosen] = useState(false);
  const isOther = otherChosen || (documentType !== "" && !isListedOption);
  const selectValue = isOther ? OTHER_DOCUMENT_TYPE : documentType;

  const handleSelect = (value: string) => {
    const choseOther = value === OTHER_DOCUMENT_TYPE;
    setOtherChosen(choseOther);
    // "Others" starts empty until a name is typed.
    onDocumentTypeChange(choseOther ? "" : value);
  };

  const openPicker = () => inputRef.current?.click();
  const clearFile = () => {
    onFileChange(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="space-y-3">
      <div>
        <label
          htmlFor={selectId}
          className="block text-body-sm fw-medium text-foreground mb-1.5"
        >
          {typeLabel}
        </label>
        <select
          id={selectId}
          value={selectValue}
          onChange={(e) => handleSelect(e.target.value)}
          className={selectClassName}
        >
          <option value="">Select document type</option>
          {options.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      {isOther && (
        <div>
          <label
            htmlFor={customTypeId}
            className="block text-body-sm fw-medium text-foreground mb-1.5"
          >
            Document Name
          </label>
          <input
            id={customTypeId}
            value={documentType}
            onChange={(e) => onDocumentTypeChange(e.target.value)}
            maxLength={CUSTOM_DOCUMENT_TYPE_MAX_LENGTH}
            placeholder="Enter the document name"
            className={selectClassName}
          />
        </div>
      )}

      {(documentType || isOther) && (
        <div className="border border-border rounded-xl p-4 space-y-3">
          <p className="text-body-sm fw-medium text-foreground">{uploadLabel}</p>

          {file ? (
            <div className="flex items-center justify-between gap-2 bg-muted border border-border rounded-lg px-3 py-2 text-body-sm">
              <span className="truncate text-foreground">{file.name}</span>
              <button
                type="button"
                onClick={clearFile}
                className="text-muted-foreground hover:text-red-500 shrink-0 cursor-pointer"
                aria-label={`Remove ${uploadLabel}`}
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <>
              {existingDocument && (
                <a
                  href={profileUrl(existingDocument)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-body-sm text-primary hover:underline"
                >
                  <FileText size={16} /> View uploaded document
                </a>
              )}
              <button
                type="button"
                onClick={openPicker}
                className="w-full flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl p-6 hover:border-primary transition cursor-pointer"
              >
                <Upload className="text-muted-foreground mb-2" size={20} />
                <span className="text-caption text-muted-foreground">
                  {existingDocument ? "Replace file (PDF, JPG or PNG)" : "PDF, JPG or PNG"}
                </span>
              </button>
            </>
          )}

          <input
            ref={inputRef}
            type="file"
            className="hidden"
            accept={ACCEPTED_FILES}
            onChange={(e) => {
              const selected = e.target.files?.[0];
              if (selected) onFileChange(selected);
            }}
          />
        </div>
      )}
    </div>
  );
}
