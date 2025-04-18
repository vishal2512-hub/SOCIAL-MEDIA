import { db } from "../connect.js";

// Get a specific conversation
export const getConversation = async (req, res) => {
  try {
    const conversation = await db.query(
      `SELECT c.*, u.id AS userId, u.username, u.profilePic 
       FROM conversations c 
       JOIN conversation_members cm ON c.id = cm.conversation_id
       JOIN users u ON (cm.user_id != ? AND cm.user_id = u.id)
       WHERE c.id = ?`,
      [req.userId, req.params.conversationId]
    );

    if (conversation.length > 0) {
      res.status(200).json(conversation[0]);
    } else {
      res.status(404).json({ message: "Conversation not found" });
    }
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error retrieving conversation", error: err });
  }
};

// Create a new conversation
export const createConversation = async (req, res) => {
  try {
    const { senderId, receiverId } = req.body;

    // Create the conversation
    const result = await db.query(
      "INSERT INTO conversations (created_at) VALUES (NOW())"
    );
    const conversationId = result.insertId;

    // Add members to the conversation
    await db.query(
      "INSERT INTO conversation_members (conversation_id, user_id) VALUES (?, ?), (?, ?)",
      [conversationId, senderId, conversationId, receiverId]
    );

    res
      .status(200)
      .json({ message: "Conversation created successfully", conversationId });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error creating conversation", error: err });
  }
};

// Check if a conversation exists between two users
export const checkConversation = async (req, res) => {
  try {
    const { userId1, userId2 } = req.params;
    console.log("Params:", userId1, userId2);

    const [rows] = await db.execute(
      `SELECT c.id 
       FROM conversations c
       JOIN conversation_members cm1 ON c.id = cm1.conversation_id
       JOIN conversation_members cm2 ON c.id = cm2.conversation_id
       WHERE cm1.user_id = ? AND cm2.user_id = ?
       LIMIT 1`,
      [userId1, userId2]
    );

    console.log("Query Result:", rows);

    if (rows.length > 0) {
      return res.status(200).json({ exists: true, conversationId: rows[0].id });
    } else {
      return res.status(200).json({ exists: false });
    }
  } catch (err) {
    console.error("Error checking conversation:", err);
    return res.status(500).json({ message: "Error checking conversation", error: err.message });
  }
};