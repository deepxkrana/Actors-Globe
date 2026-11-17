import multer from "multer";
import { ALLOWED_PHOTO_MIMES, ALLOWED_VIDEO_MIMES, MAX_VIDEO_SIZE } from "../validators/media.validator.js";

const storage = multer.memoryStorage();

const allowedMimes: string[] = [...ALLOWED_PHOTO_MIMES, ...ALLOWED_VIDEO_MIMES];

export const uploadMediaMiddleware = multer({
  storage,
  limits: {
    fileSize: MAX_VIDEO_SIZE
  },
  fileFilter: (_req, file, cb) => {
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type (${file.mimetype}). Allowed types: JPEG, PNG, WEBP, MP4, WEBM, QuickTime.`));
    }
  }
}).single("file");
