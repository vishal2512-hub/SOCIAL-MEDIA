import { db } from "../connect.js";
import jwt from "jsonwebtoken";

export const getLikes = (req, res) => {
  const q = "SELECT userId FROM likes WHERE postId = ?";

  db.query(q, [req.query.postid], (err, data) => {
    if (err) return res.status(500).json(err);
    return res.status(200).json(data.map((like) => like.userId));
  });
};

export const addLike = (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not logged in!");

  jwt.verify(token, "secretkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    const q = "INSERT INTO likes(`userId`, `postId`) VALUES (?, ?)";
    const values = [userInfo.id, req.body.postId];

    db.query(q, values, (err, data) => {
      if (err) {
        // Check for duplicate entry
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(409).json("Already liked");
        }
        return res.status(500).json(err);
      }
      
      // Get updated like count
      const getLikesQuery = "SELECT userId FROM likes WHERE postId = ?";
      db.query(getLikesQuery, [req.body.postId], (err, likes) => {
        if (err) return res.status(500).json(err);
        return res.status(200).json(likes.map(like => like.userId));
      });
    });
  });
};

export const deleteLike = (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not logged in!");

  jwt.verify(token, "secretkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    const q = "DELETE FROM likes WHERE `userId` = ? AND `postId` = ?";
    const values = [userInfo.id, req.query.postid];

    db.query(q, values, (err, data) => {
      if (err) return res.status(500).json(err);
      
      // Get updated like count
      const getLikesQuery = "SELECT userId FROM likes WHERE postId = ?";
      db.query(getLikesQuery, [req.query.postid], (err, likes) => {
        if (err) return res.status(500).json(err);
        return res.status(200).json(likes.map(like => like.userId));
      });
    });
  });
};