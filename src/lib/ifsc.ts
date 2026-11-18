import axios from "axios";

/**
 * IFSC lookup via Razorpay's free public API (https://ifsc.razorpay.com).
 * Uses a bare axios call on purpose: the shared `api` instance attaches our
 * auth token, which must never be sent to a third-party domain.
 */
const IFSC_LOOKUP_URL = "https://ifsc.razorpay.com";
const IFSC_REGEX = /^[A-Z]{4}0[A-Z0-9]{6}$/;
export interface IfscDetails {
  BANK: string;
  BANKCODE: string;
  IFSC: string;
  BRANCH: string;
  ADDRESS: string;
  CITY: string;
  DISTRICT: string;
  STATE: string;
  MICR: string | null;
  NEFT: boolean;
  RTGS: boolean;
  IMPS: boolean;
  UPI: boolean;
}

export const normalizeIfsc = (value: string) => value.trim().toUpperCase();

export const isValidIfscFormat = (value: string) => IFSC_REGEX.test(normalizeIfsc(value));

/**
 * Returns bank details for a valid IFSC, or null when the format is invalid
 * or Razorpay does not recognise the code (HTTP 404). Other errors are rethrown.
 */
export async function fetchIfscDetails(
  code: string,
  signal?: AbortSignal
): Promise<IfscDetails | null> {
  const ifsc = normalizeIfsc(code);
  if (!IFSC_REGEX.test(ifsc)) return null;

  try {
    const { data } = await axios.get<IfscDetails>(`${IFSC_LOOKUP_URL}/${ifsc}`, {
      signal,
      timeout: 10000,
    });
    return data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) return null;
    throw error;
  }
}
