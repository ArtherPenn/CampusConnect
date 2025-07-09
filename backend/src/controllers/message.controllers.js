import User from "../models/user.models.js";
import Message from "../models/message.models.js";
import Contact from "../models/contacts.models.js";

import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

const getUsersForSearchBar = async (request, response) => {
  try {
    const loggedUserId = request.user._id;

    const contactDoc = await Contact.findOne({ userId: loggedUserId });
    const contactIds = contactDoc?.contacts || [];

    const filteredUsers = await User.find({
      _id: {
        $nin: [...contactIds, loggedUserId],
      },
    }).select("-password"); //can also be sorted !

    response.status(200).json(filteredUsers);
  } catch (error) {
    console.error("Error in getUsersForSideBar controller:\n", error);
    response.status(500).json({ message: "Internal server error !" });
  }
};

const getMessages = async (request, response) => {
  try {
    const { id: chatToUserId } = request.params;
    const currentUserId = request.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: currentUserId, receiverId: chatToUserId },
        { senderId: chatToUserId, receiverId: currentUserId },
      ],
    });

    response.status(200).json(messages);
  } catch (error) {
    console.error("Error in getMessages controller:\n", error);
    response.status(500).json({ message: "Internal server error !" });
  }
};

const sendMessages = async (request, response) => {
  try {
    const { id: receiverId } = request.params;
    const senderId = request.user._id;
    let { text, image } = request.body;

    if (image) {
      const cloudinaryResponse = await cloudinary.uploader.upload(image);
      image = cloudinaryResponse.secure_url;
    }

    const newMessage = await Message.create({
      senderId,
      receiverId,
      text,
      image,
    });

    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("message", newMessage);
    }

    response.status(201).json(newMessage);
  } catch (error) {
    console.error("Error in sendMessages controller:\n", error);
    response.status(500).json({ message: "Internal server error !" });
  }
};

export { getUsersForSearchBar, getMessages, sendMessages };
