const pool = require("../config/db");
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken")
const multer = require("multer");
const path = require("path");

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Save images in the uploads folder
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
  }
});

// File filter (only allow images)
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"), false);
  }
};

// Initizlize multer
exports.upload = multer({ storage, fileFilter })




exports.getPhotos = async (req, res) => {
  try {
    const { userId } = req.query;
    const result = await pool.query(
      `select p.id, 
        p.url, 
        CONCAT(u.first_name, ' ', u.last_name) as fullname,
        COUNT(photoId) as likeCount,
        EXISTS (SELECT * from likes WHERE userId = $1 and photoId = p.id) as isLiked

        from photos p
        left join likes l on l.photoId = p.id
        inner join users u
        on p.userId = u.id

        GROUP BY p.id, u.id`,
      [userId]
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.log(error);
    res.status(500).send("Girigitton kodida nomaqbul hatolik mavjud");
  }
};

exports.myPhotos = async (req, res) => {
  try {
    const { userId } = req.params;
    let result;
    result = await pool.query("SELECT * FROM photos WHERE userId = $1", [
      userId,
    ]);
    return res.status(200).json(result.rows);
  } catch (error) {
    console.log(error);
    res.status(500).send("Girigitton kodida nomaqbul hatolik mavjud");
  }
};


exports.deletePhoto = async (req, res) => {
  try {
    const id = req.params.id;
    await pool.query("delete from photos where id=$1 ", [id]);
    res.json({ message: "Muvaffaqiyatli o'chirildi" });
  } catch (error) {
    console.log(error);
    if ((error.name === "JsonWebTokenError")) {
      return res.status(401).json({ message: "Token xato" });
    }
    res.status(500).send("Girigitton kodida nomaqbul hatolik mavjud");
  }
};
exports.addPhoto = async (req, res) => {
  try {
    const { url, userId } = req.body;
    const result = await pool.query(
      "INSERT INTO photos (url, userId) VALUES ($1, $2) RETURNING *",
      [url, userId]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.name = 'JsonWebTokenError') {
      return res.status(401).json({ message: "Invalid token" })
    }
    console.log(error);
    res.status(500).send("Girigitton kodida nomaqbul hatolik mavjud");
  }
};
