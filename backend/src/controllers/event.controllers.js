import Event from "../models/event.models.js";
import Group from "../models/group.models.js";
import Message from "../models/message.models.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

const createEvent = async (request, response) => {
  try {
    const { title, description, eventDate, groupId } = request.body;
    const createdBy = request.user._id;

    if (!title || !eventDate || !groupId) {
      return response.status(400).json({ 
        message: "Title, event date, and group ID are required!" 
      });
    }

    // Verify user is admin of the group
    const group = await Group.findById(groupId);
    if (!group) {
      return response.status(404).json({ message: "Group not found!" });
    }

    if (group.admin.toString() !== createdBy.toString()) {
      return response.status(403).json({ 
        message: "Only group admin can create events!" 
      });
    }

    // Check if event date is in the future
    const eventDateTime = new Date(eventDate);
    if (eventDateTime <= new Date()) {
      return response.status(400).json({ 
        message: "Event date must be in the future!" 
      });
    }

    const newEvent = new Event({
      title,
      description: description || "",
      eventDate: eventDateTime,
      groupId,
      createdBy,
    });

    await newEvent.save();
    
    const populatedEvent = await Event.findById(newEvent._id)
      .populate("createdBy", "name email")
      .populate("groupId", "name");

    response.status(201).json(populatedEvent);
  } catch (error) {
    console.error("Error in createEvent controller:", error);
    response.status(500).json({ message: "Internal server error!" });
  }
};

const getGroupEvents = async (request, response) => {
  try {
    const { groupId } = request.params;
    const userId = request.user._id;

    // Verify user is a member of the group
    const group = await Group.findById(groupId);
    if (!group || !group.members.includes(userId)) {
      return response.status(403).json({ message: "Access denied!" });
    }

    const events = await Event.find({ 
      groupId: groupId,
      isCompleted: false 
    })
    .populate("createdBy", "name email")
    .sort({ eventDate: 1 });

    response.status(200).json(events);
  } catch (error) {
    console.error("Error in getGroupEvents controller:", error);
    response.status(500).json({ message: "Internal server error!" });
  }
};

const deleteEvent = async (request, response) => {
  try {
    const { eventId } = request.params;
    const userId = request.user._id;

    const event = await Event.findById(eventId).populate("groupId");
    if (!event) {
      return response.status(404).json({ message: "Event not found!" });
    }

    // Check if user is admin of the group or creator of the event
    if (event.groupId.admin.toString() !== userId.toString() && 
        event.createdBy.toString() !== userId.toString()) {
      return response.status(403).json({ 
        message: "Only group admin or event creator can delete events!" 
      });
    }

    await Event.findByIdAndDelete(eventId);
    response.status(200).json({ message: "Event deleted successfully!" });
  } catch (error) {
    console.error("Error in deleteEvent controller:", error);
    response.status(500).json({ message: "Internal server error!" });
  }
};

// Function to check and send event reminders (called by scheduler)
const checkAndSendReminders = async () => {
  try {
    const now = new Date();
    const currentDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const nextDate = new Date(currentDate);
    nextDate.setDate(nextDate.getDate() + 1);

    // Find events that are due today and haven't sent reminders yet
    const dueEvents = await Event.find({
      eventDate: {
        $gte: currentDate,
        $lt: nextDate
      },
      isCompleted: false,
      reminderSent: false
    })
    .populate("createdBy", "name")
    .populate("groupId", "name members");

    for (const event of dueEvents) {
      try {
        // Create reminder message
        const reminderMessage = await Message.create({
          senderId: event.createdBy._id,
          groupId: event.groupId._id,
          messageType: "group",
          text: `🔔 Event Reminder: "${event.title}"${event.description ? `\n📝 ${event.description}` : ''}\n📅 Today`,
        });

        const populatedMessage = await Message.findById(reminderMessage._id)
          .populate("senderId", "name profilePicture");

        // Send to all group members
        event.groupId.members.forEach(memberId => {
          const memberSocketId = getReceiverSocketId(memberId);
          if (memberSocketId) {
            io.to(memberSocketId).emit("groupMessage", {
              ...populatedMessage.toObject(),
              groupId: event.groupId._id
            });
            
            // Send event notification
            io.to(memberSocketId).emit("eventNotification", {
              title: "Event Reminder",
              message: `"${event.title}" is scheduled for today!`,
              groupName: event.groupId.name,
              eventId: event._id
            });
          }
        });

        // Mark reminder as sent and event as completed
        await Event.findByIdAndUpdate(event._id, { 
          reminderSent: true,
          isCompleted: true 
        });

        console.log(`Reminder sent for event: ${event.title}`);
      } catch (error) {
        console.error(`Error sending reminder for event ${event._id}:`, error);
      }
    }
  } catch (error) {
    console.error("Error in checkAndSendReminders:", error);
  }
};

export { createEvent, getGroupEvents, deleteEvent, checkAndSendReminders };