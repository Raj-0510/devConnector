const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId },
  receiverId: { type: mongoose.Schema.Types.ObjectId },
  type: { type: String, enum: ["like", "comment", "follow"], required: true },
  post: { type: Boolean, default: false },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Notification', notificationSchema);