import { API } from "./endpoints";
import { POST } from "./request";
import { uploadText } from "./text";

/** Upload scopes the API accepts; each maps to an S3 folder, file types and a size cap. */
export type UploadScope =
  | "profile"
  | "agent-document"
  | "bank-document"
  | "review-media"
  | "package-media";

interface PresignResponse {
  success: boolean;
  message: string;
  data: {
    uploadUrl: string;
    method: "PUT";
    headers: Record<string, string>;
    /** Value to send with the form: the file's S3 URL, e.g. "https://<bucket>.s3.<region>.amazonaws.com/packages/12/<uuid>.mp4". */
    path: string;
    expiresIn: number;
  };
}

// Some browsers leave File.type empty for .mkv (and sometimes .mov); fall back on the extension.
const MIME_BY_EXTENSION: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  pdf: "application/pdf",
  mp4: "video/mp4",
  mov: "video/quicktime",
  webm: "video/webm",
  avi: "video/x-msvideo",
  mkv: "video/x-matroska",
};

const PARALLEL_UPLOADS = 4;

function contentTypeOf(file: File): string {
  if (file.type) return file.type;
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  return MIME_BY_EXTENSION[extension] ?? "application/octet-stream";
}

/**
 * Uploads one file straight to S3 and returns the path to submit with the form.
 *
 *   1. ask the API for a short-lived presigned PUT URL for `scope`
 *   2. PUT the file to S3 with exactly the headers the API signed
 *
 * Raw fetch, not the axios client: the request goes to S3, so it must not carry our
 * Authorization header. fetch only rejects on network or CORS failures, so a non-2xx
 * answer from S3 (expired URL, size or type mismatch) is turned into an error here.
 * Type and size errors from step 1 reach the caller as the API's own message.
 */
export async function uploadFile(file: File, scope: UploadScope): Promise<string> {
  const { data } = await POST<PresignResponse>(API.UPLOAD.PRESIGN, {
    scope,
    contentType: contentTypeOf(file),
    contentLength: file.size,
  });

  let response: Response;
  try {
    response = await fetch(data.uploadUrl, {
      method: data.method,
      headers: data.headers,
      body: file,
    });
  } catch {
    throw new Error(uploadText.network(file.name));
  }
  if (!response.ok) throw new Error(uploadText.failed(file.name));

  return data.path;
}

/** Uploads several files (a few at a time) and returns their paths in the same order. */
export async function uploadFiles(files: File[], scope: UploadScope): Promise<string[]> {
  const paths: string[] = new Array(files.length);
  let next = 0;

  const worker = async () => {
    while (next < files.length) {
      const index = next++;
      paths[index] = await uploadFile(files[index], scope);
    }
  };

  await Promise.all(
    Array.from({ length: Math.min(PARALLEL_UPLOADS, files.length) }, worker)
  );
  return paths;
}

/** uploadFile for an optional file: resolves to null when there is nothing to upload. */
export function uploadOptionalFile(file: File | null | undefined, scope: UploadScope) {
  return file ? uploadFile(file, scope) : Promise.resolve(null);
}
