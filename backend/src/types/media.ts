export type MediaType = "PHOTO" | "VIDEO";

export type MediaResponse = {
  id: string;
  actorId: string;
  type: MediaType;
  storageKey: string;
  originalFileName: string;
  mimeType: string;
  fileSize: number;
  duration?: number | null;
  url: string;
  createdAt: Date;
  updatedAt: Date;
};
