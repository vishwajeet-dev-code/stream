
import multer from "multer";
import crypto from "crypto";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp");
  },

  filename: function (req, file, cb) {
    crypto.randomBytes(16, function (err, raw) {
      if (err) return cb(err);

      cb(null, file.fieldname + "-" + raw.toString("hex"));
    });
  },
});

// Validate file types
const fileFilter = (req, file, cb) => {
  if (file.fieldname === "videoFile") {
    if (file.mimetype.startsWith("video/")) {
      return cb(null, true);
    }

    return cb(
      new multer.MulterError("LIMIT_UNEXPECTED_FILE", file.fieldname)
    );
  }

  if (file.fieldname === "thumbnail") {
    if (file.mimetype.startsWith("image/")) {
      return cb(null, true);
    }

    return cb(
      new multer.MulterError("LIMIT_UNEXPECTED_FILE", file.fieldname)
    );
  }

  return cb(
    new multer.MulterError("LIMIT_UNEXPECTED_FILE", file.fieldname)
  );
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 500 * 1024 * 1024, // 500 MB per file
  },
});
