const multer = require('multer');
const path = require('path');

// Storage configuration

const storage = multer.diskStorage({

    destination: function (req, file, cb) {
        cb(null, "./uploads/");
    },

    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); // Utilisation correcte de path.extname
    },

});

// File filter

const fileFilter = (req, file, cb) => {

    if (file.mimetype.startsWith("image/")) { // Utilisation correcte de mimetype et startsWith
        cb(null, true);
    } else {
        cb(new Error("Only images are allowed"), false);
    }

};

// Upload configuration

const upload = multer({storage, fileFilter});

module.exports = upload;
