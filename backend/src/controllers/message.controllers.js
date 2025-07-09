import User from "../models/user.models.js";
import Message from "../models/message.models.js";
import Contact from "../models/contacts.models.js";
import Group from "../models/group.models.js";

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

const getDirectMessages = async (request, response) => {
  try {
    const { id: chatToUserId } = request.params;
    const currentUserId = request.user._id;

    const messages = await Message.find({
      messageType: "direct",
      $or: [
        { senderId: currentUserId, receiverId: chatToUserId },
        { senderId: chatToUserId, receiverId: currentUserId },
      ],
    }).populate("senderId", "name profilePicture");

    response.status(200).json(messages);
  } catch (error) {
    console.error("Error in getDirectMessages controller:\n", error);
    response.status(500).json({ message: "Internal server error !" });
  }
};

const getGroupMessages = async (request, response) => {
  try {
    const { groupId } = request.params;
    const currentUserId = request.user._id;

    // Verify user is a member of the group
    const group = await Group.findById(groupId);
    if (!group || !group.members.includes(currentUserId)) {
      return response.status(403).json({ message: "Access denied!" });
    }

    const messages = await Message.find({
      groupId: groupId,
      messageType: "group",
    }).populate("senderId", "name profilePicture");

    response.status(200).json(messages);
  } catch (error) {
    console.error("Error in getGroupMessages controller:\n", error);
    response.status(500).json({ message: "Internal server error !" });
  }
};

const sendDirectMessage = async (request, response) => {
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
      messageType: "direct",
      text,
      image,
    });

    const populatedMessage = await Message.findById(newMessage._id)
      .populate("senderId", "name profilePicture");

    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("directMessage", populatedMessage);
    }

    response.status(201).json(populatedMessage);
  } catch (error) {
    console.error("Error in sendDirectMessage controller:\n", error);
    response.status(500).json({ message: "Internal server error !" });
  }
};

const sendGroupMessage = async (request, response) => {
  try {
    const { groupId } = request.params;
    const senderId = request.user._id;
    let { text, image } = request.body;

    // Verify user is a member of the group
    const group = await Group.findById(groupId);
    if (!group || !group.members.includes(senderId)) {
      return response.status(403).json({ message: "Access denied!" });
    }

    if (image) {
      const cloudinaryResponse = await cloudinary.uploader.upload(image);
      image = cloudinaryResponse.secure_url;
    }

    const newMessage = await Message.create({
      senderId,
      groupId,
      messageType: "group",
      text,
      image,
    });

    const populatedMessage = await Message.findById(newMessage._id)
      .populate("senderId", "name profilePicture");

    // Send to all group members except sender
    group.members.forEach(memberId => {
      if (memberId.toString() !== senderId.toString()) {
        const memberSocketId = getReceiverSocketId(memberId);
        if (memberSocketId) {
          io.to(memberSocketId).emit("groupMessage", {
            ...populatedMessage.toObject(),
            groupId: groupId
          });
        }
      }
    });

    response.status(201).json(populatedMessage);
  } catch (error) {
    console.error("Error in sendGroupMessage controller:\n", error);
    response.status(500).json({ message: "Internal server error !" });
  }
};

export { 
  getUsersForSearchBar, 
  getDirectMessages, 
  getGroupMessages,
  sendDirectMessage, 
  sendGroupMessage 
};
