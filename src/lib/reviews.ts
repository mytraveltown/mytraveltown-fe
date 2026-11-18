import { packageText } from "@/lib/text";

/** Limits mirror the backend review upload route. */
export const REVIEW_LIMITS = {
  minCommentLength: 10,
  maxCommentLength: 2000,
  minReplyLength: 2,
  maxReplyLength: 1000,
  maxMediaFiles: 5,
  maxFileSizeMb: 25,
} as const;

export const REVIEW_MEDIA_ACCEPT =
  "image/jpeg,image/png,image/webp,video/mp4,video/quicktime,video/webm";

const ALLOWED_MEDIA_TYPES = new Set(REVIEW_MEDIA_ACCEPT.split(","));

/** Returns an error message for the first invalid file, or null when the selection is valid. */
export function validateReviewMedia(files: File[]): string | null {
  const text = packageText.reviews.form;
  if (files.length > REVIEW_LIMITS.maxMediaFiles) {
    return text.tooManyFiles(REVIEW_LIMITS.maxMediaFiles);
  }
  for (const file of files) {
    if (!ALLOWED_MEDIA_TYPES.has(file.type)) return text.fileTypeInvalid(file.name);
    if (file.size > REVIEW_LIMITS.maxFileSizeMb * 1024 * 1024) {
      return text.fileTooLarge(file.name, REVIEW_LIMITS.maxFileSizeMb);
    }
  }
  return null;
}

export function isVideoFile(file: File) {
  return file.type.startsWith("video/");
}

export function formatReviewDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function getErrorMessage(err: unknown, fallback: string) {
  return err && typeof err === "object" && "message" in err
    ? String((err as { message: string }).message)
    : fallback;
}
