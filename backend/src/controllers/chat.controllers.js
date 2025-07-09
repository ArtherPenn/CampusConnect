import Contact from "../models/contacts.models.js";

const getUsersForSideBar = async (request, response) => {
  const { id: loggedUserId } = request.params;
  try {
    const filteredUsers = await Contact.find({ userId: loggedUserId }).populate(
      "contacts"
    );
    response.status(200).json(filteredUsers);
  } catch (error) {
    console.error("Error in  getAddedUsersForSidebar controller:\n", error);
    response.status(500).json({ message: "Darshan error !" });
  }
};

const addUsersToContacts = async (request, response) => {
  const userIdToAdd = request.params.id;
  const loggedInUserId = request.user._id;

  const result = await Contact.findOneAndUpdate(
    { userId: loggedInUserId },
    { $addToSet: { contacts: userIdToAdd } },
    { new: true, upsert: true }
  );

  await Contact.findOneAndUpdate(
    { userId: userIdToAdd },
    { $addToSet: { contacts: loggedInUserId } }
  );

  response.status(200).json(result);
};

export { getUsersForSideBar, addUsersToContacts };
