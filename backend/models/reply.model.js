// models/reply.model.js
import mongoose from "mongoose";

const replySchema = new mongoose.Schema(
  {
    comment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      required: true,
      index: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
    },
    attachments: [
      {
        url: { type: String, required: true },
        type: {
          type: String,
          enum: ["image", "video", "file"],
          required: true,
        },
        filename: { type: String, required: true },
        size: Number,
      },
    ],
    deleted: {
      type: Boolean,
      default: false,
    },
    reactions: {
      like: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
      love: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
      celebrate: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
      dislike: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    },
  },
  { timestamps: true }
);

export default mongoose.model("Reply", replySchema);