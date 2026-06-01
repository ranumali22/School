const multer = require("multer");
const path = require("path");
const fs = require("fs");


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let dest = "uploads/employee/";

    if (file.fieldname === "upload_logo" || req.body.upload_type === "school_logo") {
      const schoolName = (req.body.school_name || "default").replace(/[^a-z0-9]/gi, '_').toLowerCase();
      dest = `uploads/school_logos/${schoolName}/`;
    } else if (file.fieldname === "banner_image") {
      dest = "uploads/banners/";
    } else if (file.fieldname === "photo") {
      dest = "uploads/student/";
    }

    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueName + path.extname(file.originalname));
  },
});


const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/") || file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new Error("Only images and PDF allowed"), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
});
module.exports = upload;