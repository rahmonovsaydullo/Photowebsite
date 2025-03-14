const pool = require("../config/db");


exports.getPhotos = async (req, res) => {
  try {
    const { userId } = req.query;
    const filepath = req.path.file
    const result = await pool.query(
      `select p.id, 
        p.filepath, 
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
    const photos = result.rows.map(photo => {
      return { ...photo, url: "http://localhost:4000/" + photo.filepath }
    })
    res.status(200).json(photos);
  } catch (error) {
    console.log(error);
    res.status(500).send("Girigitton kodida nomaqbul hatolik mavjud");
  }
};

exports.myPhotos = async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await pool.query("SELECT * FROM photos WHERE userId = $1", [
      userId,
    ]);

    const photos = result.rows.map(photo => {
      return { ...photo, url: "http://localhost:4000/" + photo.filepath }
    })
    return res.status(200).json(photos);
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
    const filepath = req.file.path
    const result = await pool.query(
      "INSERT INTO photos (filepath, userId) VALUES ($1, $2) RETURNING *",
      [filepath, userId]
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
