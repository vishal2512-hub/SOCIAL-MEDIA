import moment from "moment/moment.js";
import { db } from "../connect.js";
import jwt from "jsonwebtoken";

export const getPosts = async (req, res) => {
  const userId = req.query.userId;
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not logged in!");

  jwt.verify(token, "secretkey", async (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    const q = userId
      ? `SELECT p.*, u.id AS userId, u.name, u.profilePic 
         FROM posts AS p 
         JOIN users AS u ON u.id = p.userId 
         WHERE p.userId = ? 
         ORDER BY p.createdAt DESC`
      : `SELECT p.*, u.id AS userId, u.name, u.profilePic 
         FROM posts AS p 
         JOIN users AS u ON u.id = p.userId
         LEFT JOIN relationships AS r ON p.userId = r.followedUserId 
         WHERE (r.followerUserId = ? OR p.userId = ?) OR ? IS NULL
         ORDER BY p.createdAt DESC`;

    const values = userId ? [userId] : [userInfo.id, userInfo.id, userId];

    db.query(q, values, (err, data) => {
      if (err) return res.status(500).json(err);
      return res.status(200).json(data); // ✅ Returns posts data instead of a string
    });
  });
};


export const addPost = (req, res) => {
    const token = req.cookies.accessToken;
    if (!token) return res.status(401).json("Not logged in!");
  
    jwt.verify(token, "secretkey", (err, userInfo) => {
      if (err) return res.status(403).json("Token is not valid!");

      console.log(req.body.desc, userInfo.id)
      
      const q = "INSERT INTO posts(`desc`, `img`, `createdAt`, `userId`) VALUES (?, ?,?,?)";
      const values = [
        req.body.desc,
        req.body.img || null, // Handle cases where no image is uploaded
        moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
        userInfo.id
      ]
  
      db.query(q, values, (err, data) => {
        if (err) return res.status(500).json(err);
        return res.status(200).json("Post has been created.");
      });
    });
  };


export const deletePost = (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not logged in!");

  jwt.verify(token, "secretkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    const q = "DELETE FROM posts WHERE `id`=? AND `userId` = ?";

    db.query(q, [req.params.id, userInfo.id], (err, data) => {
      if (err) return res.status(500).json(err);
      if (data.affectedRows > 0)
        return res.status(200).json("Post has been deleted.");
      return res.status(403).json("You can delete only your post");
    });
  });
};
