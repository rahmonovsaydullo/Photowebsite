const pool = require("../config/db");
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken")


exports.signup = async (req, res) => {
  try {
    const { first_name, last_name, user_name, password } = req.body;
    const test = await pool.query(
      `SELECT * FROM users WHERE user_name = $1 LIMIT 1`,
      [user_name]
    );

    if (test.rows.length > 0) {
      return res.status(401).json({ message: "Username already exists" });
    }


    const salt = await bcrypt.genSalt(10)
    const encryptedPassword = await bcrypt.hash(password, salt)
    const result = await pool.query(
      `insert into users(first_name, last_name, user_name, password) values ($1, $2, $3, $4) returning *`,
      [first_name, last_name, user_name, encryptedPassword]
    );
    res.status(201).json(result.rows);
  } catch (error) {
    console.log(error);
    res.status(500).send("Girigitton kodida nomaqbul hatolik mavjud");
  }
};
exports.login = async (req, res) => {
  try {
    const { user_name, password } = req.body;
    const result = await pool.query(
      `SELECT id, first_name, last_name, user_name, password FROM users WHERE user_name = $1 `,
      [user_name]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Invalid username or password" });
    }

    const user = result.rows[0]
    const isValidPassword = await bcrypt.compare(password, user.password)
    if(!isValidPassword){
      return res.status(404).json({ message: "Invalid username or password" });

    }

    const token = jwt.sign({userId: user.id}, "The secret of the secretness word of secret", {
      expiresIn: "1h"
    })
    res.status(200).json({ user, token});
  } catch (error) {
    console.log(error);
    res.status(500).send("Girigitton kodida nomaqbul hatolik mavjud");
  }
};

