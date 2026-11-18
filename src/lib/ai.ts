import { POST } from "./request";
import { API } from "./endpoints";

/** Text fields the backend knows how to refine. */
export type RefineTextField = "about_me" | "location_description";

type ApiResponse<T> = { success: boolean; message: string; data: T };

/** AI responses take longer than regular API calls; also used by saves that refine text with AI. */
export const AI_REQUEST_TIMEOUT_MS = 45000;

/** Asks the backend to rewrite free text as clean, professional, well-formatted copy. */
export async function refineText(text: string, field: RefineTextField): Promise<string> {
  const response = await POST<ApiResponse<{ text: string }>>(
    API.AI.REFINE_TEXT,
    { text, field },
    { timeout: AI_REQUEST_TIMEOUT_MS }
  );
  return response.data.text;
}
