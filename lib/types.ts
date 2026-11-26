export type PasteMode = "text" | "code" | "file";

export interface StoredAttachment {
  mimeType: string;
  originalName: string;
  size: number;
  storedName: string;
}

export interface PasteRecord {
  accessCode: string;
  attachment: StoredAttachment | null;
  content: string;
  createdAt: string;
  expiresAt: string;
  id: string;
  language: string;
  mode: PasteMode;
  title: string;
}

export interface CreatePasteInput {
  attachment?: {
    buffer: Buffer;
    mimeType: string;
    originalName: string;
    size: number;
  };
  content: string;
  language: string;
  mode: PasteMode;
  title: string;
}
