import { db } from "../connect.js";
import jwt from "jsonwebtoken";
import moment from "moment";

// GET Notifications
export const getNotifications = (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not logged in!");

  jwt.verify(token, "secretkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    const q = `
      SELECT n.*, u.id AS userId, u.name, u.profilePic 
      FROM notifications AS n 
      JOIN users AS u ON (u.id = n.senderId)
      WHERE n.receiverId = ? 
      ORDER BY n.createdAt DESC`;

    db.query(q, [userInfo.id], (err, data) => {
      if (err) return res.status(500).json(err);
      return res.status(200).json(data);
    });
  });
};

// CREATE Notification
export const createNotification = (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not logged in!");

  jwt.verify(token, "secretkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    const q = `INSERT INTO notifications (type, senderId, receiverId, postId, createdAt, isRead) 
               VALUES (?, ?, ?, ?, ?, ?)`;

    const values = [
      req.body.type,        
      userInfo.id,           
      req.body.receiverId,  
      req.body.postId || null, 
      moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"), 
      false,                 
    ];

    db.query(q, values, (err, data) => {
      if (err) return res.status(500).json(err);
      return res.status(200).json("Notification has been created.");
    });
  });
};

// MARK Notifications as Read
export const markAsRead = (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not logged in!");

  jwt.verify(token, "secretkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    const q = "UPDATE notifications SET isRead = true WHERE receiverId = ?";

    db.query(q, [userInfo.id], (err, data) => {
      if (err) return res.status(500).json(err);
      return res.status(200).json("All notifications have been marked as read");
    });
  });
};
