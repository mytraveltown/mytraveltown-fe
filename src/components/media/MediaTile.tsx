import { AlertCircle, Eye, Loader2, Play, RotateCw, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type MediaKind = "image" | "video";
export type MediaTileStatus = "uploading" | "done" | "error";

interface MediaTileProps {
  src: string;
  kind: MediaKind;
  alt: string;
  status?: MediaTileStatus;
  error?: string;
  deleting?: boolean;
  onPreview: () => void;
  onDelete: () => void;
  onRetry?: () => void;
}

const actionButtonClass =
  "size-6 rounded-full bg-black/55 text-white flex items-center justify-center backdrop-blur-sm transition-colors disabled:opacity-50";

/**
 * One gallery thumbnail with preview (eye) and delete (trash) actions.
 * Shows an uploading overlay, or an error overlay with retry, for files still on their way to S3.
 */
export function MediaTile({
  src,
  kind,
  alt,
  status = "done",
  error,
  deleting = false,
  onPreview,
  onDelete,
  onRetry,
}: MediaTileProps) {
  const isUploading = status === "uploading";
  const hasError = status === "error";

  return (
    <div
      className={cn(
        "group relative aspect-square rounded-lg overflow-hidden border bg-neutral-100",
        hasError ? "border-red-300" : "border-neutral-200"
      )}
    >
      {kind === "image" ? (
        <img src={src} alt={alt} className="size-full object-cover" loading="lazy" />
      ) : (
        <>
          <video src={src} className="size-full object-cover" muted playsInline preload="metadata" />
          <span className="absolute bottom-1.5 left-1.5 size-5 rounded-full bg-black/55 text-white flex items-center justify-center">
            <Play size={10} className="ml-px" aria-hidden />
          </span>
        </>
      )}

      {isUploading && (
        <div className="absolute inset-0 bg-white/60 flex items-center justify-center" title="Uploading...">
          <Loader2 size={18} className="animate-spin text-blue-600" aria-label="Uploading" />
        </div>
      )}

      {hasError && (
        <div
          className="absolute inset-0 bg-red-50/90 flex flex-col items-center justify-center gap-1 p-1 text-center"
          title={error}
        >
          <AlertCircle size={16} className="text-red-500" aria-label={error || "Upload failed"} />
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="inline-flex items-center gap-1 text-caption fw-medium text-blue-700 hover:underline"
            >
              <RotateCw size={11} aria-hidden /> Retry
            </button>
          )}
        </div>
      )}

      <div className="absolute top-1 right-1 flex gap-1">
        {!hasError && (
          <button
            type="button"
            onClick={onPreview}
            className={cn(actionButtonClass, "hover:bg-blue-600")}
            aria-label={`Preview ${alt}`}
          >
            <Eye size={12} />
          </button>
        )}
        <button
          type="button"
          onClick={onDelete}
          disabled={isUploading || deleting}
          className={cn(actionButtonClass, "hover:bg-red-600")}
          aria-label={`Delete ${alt}`}
        >
          {deleting ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
        </button>
      </div>
    </div>
  );
}
