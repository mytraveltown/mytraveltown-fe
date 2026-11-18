import Hashids from "hashids";

const SECRET = import.meta.env.VITE_INVOICE_SECRET;

const hashids = new Hashids(SECRET, 10);

export const encryptId = (id: number): string => {
  return hashids.encode(id);
};

export const decryptId = (hash: string): number | null => {
  const decoded = hashids.decode(hash);

  if (decoded.length === 0) return null;

  return Number(decoded[0]);
};