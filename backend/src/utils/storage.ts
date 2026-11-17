import fs from "node:fs/promises";
import path from "node:path";
import { config } from "../config/env.js";

export interface StorageProvider {
  upload(storageKey: string, buffer: Buffer, mimeType: string): Promise<{ storageKey: string; url: string }>;
  delete(storageKey: string): Promise<void>;
  getUrl(storageKey: string): string;
}

export class LocalStorageProvider implements StorageProvider {
  private baseDir: string;

  constructor(baseDir = config.uploadsDir) {
    this.baseDir = baseDir;
  }

  async upload(
    storageKey: string,
    buffer: Buffer,
    _mimeType: string
  ): Promise<{ storageKey: string; url: string }> {
    const fullPath = path.join(this.baseDir, storageKey);
    const parentDir = path.dirname(fullPath);

    await fs.mkdir(parentDir, { recursive: true });
    await fs.writeFile(fullPath, buffer);

    return {
      storageKey,
      url: this.getUrl(storageKey)
    };
  }

  async delete(storageKey: string): Promise<void> {
    const fullPath = path.join(this.baseDir, storageKey);
    try {
      await fs.unlink(fullPath);
    } catch (error: any) {
      if (error && error.code !== "ENOENT") {
        throw error;
      }
    }
  }

  getUrl(storageKey: string): string {
    // Return relative public path served by express static
    return `/uploads/${storageKey.replace(/\\/g, "/")}`;
  }
}

export class S3StorageProvider implements StorageProvider {
  private bucket: string;

  constructor() {
    this.bucket = config.s3.bucket;
  }

  async upload(
    storageKey: string,
    _buffer: Buffer,
    _mimeType: string
  ): Promise<{ storageKey: string; url: string }> {
    if (!this.bucket || !config.s3.accessKeyId) {
      throw new Error("S3 storage credentials are not configured. Set AWS credentials or use local storage driver.");
    }
    // S3 integration endpoint format
    const url = `https://${this.bucket}.s3.${config.s3.region}.amazonaws.com/${storageKey}`;
    return { storageKey, url };
  }

  async delete(_storageKey: string): Promise<void> {
    if (!this.bucket || !config.s3.accessKeyId) {
      throw new Error("S3 storage credentials are not configured.");
    }
  }

  getUrl(storageKey: string): string {
    return `https://${this.bucket}.s3.${config.s3.region}.amazonaws.com/${storageKey}`;
  }
}

let activeStorageProvider: StorageProvider | null = null;

export const getStorageProvider = (): StorageProvider => {
  if (activeStorageProvider) {
    return activeStorageProvider;
  }

  if (config.storageDriver === "s3" && config.s3.bucket && config.s3.accessKeyId) {
    activeStorageProvider = new S3StorageProvider();
  } else {
    activeStorageProvider = new LocalStorageProvider();
  }

  return activeStorageProvider;
};
