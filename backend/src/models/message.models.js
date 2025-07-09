import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
    },
    messageType: {
      type: String,
      enum: ["direct", "group"],
      required: true,
      default: "direct",
    },
    text: {
      type: String,
    },
    image: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure either receiverId or groupId is present
messageSchema.pre('save', function(next) {
  if (this.messageType === 'direct' && !this.receiverId) {
    return next(new Error('receiverId is required for direct messages'));
  }
  if (this.messageType === 'group' && !this.groupId) {
    return next(new Error('groupId is required for group messages'));
  }
  next();
});
export default mongoose.model("Message", messageSchema);
