import Group from "../models/group.models.js";
import User from "../models/user.models.js";
import Message from "../models/message.models.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

const createGroup = async (request, response) => {
  try {
    const { name, description, memberIds } = request.body;
    const adminId = request.user._id;

    if (!name || !memberIds || memberIds.length === 0) {
      return response.status(400).json({ 
        message: "Group name and at least one member are required!" 
      });
    }

    // Ensure admin is included in members
    const allMembers = [...new Set([adminId.toString(), ...memberIds])];

    const newGroup = new Group({
      name,
      description: description || "",
      admin: adminId,
      members: allMembers,
    });

    await newGroup.save();
    
    // Populate the group with member details
    const populatedGroup = await Group.findById(newGroup._id)
      .populate("members", "name email profilePicture")
      .populate("admin", "name email profilePicture");

    // Notify all members about the new group
    allMembers.forEach(memberId => {
      const memberSocketId = getReceiverSocketId(memberId);
      if (memberSocketId) {
        io.to(memberSocketId).emit("newGroup", populatedGroup);
      }
    });

    response.status(201).json(populatedGroup);
  } catch (error) {
    console.error("Error in createGroup controller:", error);
    response.status(500).json({ message: "Internal server error!" });
  }
};

const getUserGroups = async (request, response) => {
  try {
    const userId = request.user._id;

    const groups = await Group.find({ 
      members: userId,
      isActive: true 
    })
    .populate("members", "name email profilePicture")
    .populate("admin", "name email profilePicture")
    .sort({ updatedAt: -1 });

    response.status(200).json(groups);
  } catch (error) {
    console.error("Error in getUserGroups controller:", error);
    response.status(500).json({ message: "Internal server error!" });
  }
};

const addMemberToGroup = async (request, response) => {
  try {
    const { groupId } = request.params;
    const { memberIds } = request.body;
    const userId = request.user._id;

    const group = await Group.findById(groupId);
    if (!group) {
      return response.status(404).json({ message: "Group not found!" });
    }

    // Check if user is admin
    if (group.admin.toString() !== userId.toString()) {
      return response.status(403).json({ 
        message: "Only group admin can add members!" 
      });
    }

    // Add new members (avoid duplicates)
    const newMembers = memberIds.filter(id => !group.members.includes(id));
    group.members.push(...newMembers);
    
    await group.save();

    const updatedGroup = await Group.findById(groupId)
      .populate("members", "name email profilePicture")
      .populate("admin", "name email profilePicture");

    // Notify all members about new additions
    group.members.forEach(memberId => {
      const memberSocketId = getReceiverSocketId(memberId);
      if (memberSocketId) {
        io.to(memberSocketId).emit("groupUpdated", updatedGroup);
      }
    });

    response.status(200).json(updatedGroup);
  } catch (error) {
    console.error("Error in addMemberToGroup controller:", error);
    response.status(500).json({ message: "Internal server error!" });
  }
};

const removeMemberFromGroup = async (request, response) => {
  try {
    const { groupId, memberId } = request.params;
    const userId = request.user._id;

    const group = await Group.findById(groupId);
    if (!group) {
      return response.status(404).json({ message: "Group not found!" });
    }

    // Check if user is admin or removing themselves
    if (group.admin.toString() !== userId.toString() && memberId !== userId.toString()) {
      return response.status(403).json({ 
        message: "You can only remove yourself or admin can remove members!" 
      });
    }

    // Don't allow admin to remove themselves if there are other members
    if (memberId === group.admin.toString() && group.members.length > 1) {
      return response.status(400).json({ 
        message: "Admin cannot leave group with other members. Transfer admin rights first!" 
      });
    }

    group.members = group.members.filter(id => id.toString() !== memberId);
    
    // If group becomes empty, deactivate it
    if (group.members.length === 0) {
      group.isActive = false;
    }
    
    await group.save();

    const updatedGroup = await Group.findById(groupId)
      .populate("members", "name email profilePicture")
      .populate("admin", "name email profilePicture");

    // Notify all remaining members
    group.members.forEach(memberId => {
      const memberSocketId = getReceiverSocketId(memberId);
      if (memberSocketId) {
        io.to(memberSocketId).emit("groupUpdated", updatedGroup);
      }
    });

    response.status(200).json(updatedGroup);
  } catch (error) {
    console.error("Error in removeMemberFromGroup controller:", error);
    response.status(500).json({ message: "Internal server error!" });
  }
};

const updateGroup = async (request, response) => {
  try {
    const { groupId } = request.params;
    const { name, description } = request.body;
    const userId = request.user._id;

    const group = await Group.findById(groupId);
    if (!group) {
      return response.status(404).json({ message: "Group not found!" });
    }

    // Check if user is admin
    if (group.admin.toString() !== userId.toString()) {
      return response.status(403).json({ 
        message: "Only group admin can update group details!" 
      });
    }

    if (name) group.name = name;
    if (description !== undefined) group.description = description;
    
    await group.save();

    const updatedGroup = await Group.findById(groupId)
      .populate("members", "name email profilePicture")
      .populate("admin", "name email profilePicture");

    // Notify all members about the update
    group.members.forEach(memberId => {
      const memberSocketId = getReceiverSocketId(memberId);
      if (memberSocketId) {
        io.to(memberSocketId).emit("groupUpdated", updatedGroup);
      }
    });

    response.status(200).json(updatedGroup);
  } catch (error) {
    console.error("Error in updateGroup controller:", error);
    response.status(500).json({ message: "Internal server error!" });
  }
};

export { 
  createGroup, 
  getUserGroups, 
  addMemberToGroup, 
  removeMemberFromGroup, 
  updateGroup 
};