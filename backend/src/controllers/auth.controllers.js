import User from "../models/user.models.js";
import bcrypt from "bcryptjs";
import generateToken from "../lib/utils.js";
import Contact from "../models/contacts.models.js";

const signIn = async (request, response) => {
  const { name, email, password } = request.body;

  try {
    if (!name || !email || !password) {
      console.log("SignIn request body:", request.body);
      return response
        .status(400)
        .json({ message: "All fields are required !" });
    }

    if (password.length < 6) {
      return response
        .status(400)
        .json({ message: "Password must be at least 6 characters long !" });
    }

    const user = await User.findOne({ email });
    if (user) {
      return response
        .status(400)
        .json({ message: "User already exists with this email !" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
    });

    if (newUser) {
      generateToken(newUser._id, response);
      await newUser.save();

      // await Contact.create({
      //   userId: newUser._id,
      // });

      response.status(201).json({
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
      });
    } else {
      response.status(400).json({ message: "Failed to create user !" });
    }
  } catch (error) {
    console.error("Error in signIn controller:\n", error);
    response.status(500).json({ message: "Internal server error !" });
  }
};

const logIn = async (request, response) => {
  const { email, password } = request.body;

  try {
    if (!email || !password) {
      return response
        .status(400)
        .json({ message: "All fields are required !" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return response
        .status(400)
        .json({ message: "User does not exist with this email !" });
    }

    const passMatch = await bcrypt.compare(password, user.password);
    //const passMatch = password === user.password;
    if (!passMatch) {
      return response.status(400).json({ message: "Invalid credentials !" });
    }

    generateToken(user._id, response);

    return response.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
    });
  } catch (error) {
    console.error("Error in logIn controller:\n", error);
    response.status(500).json({ message: "Internal server error !" });
  }
};

const logOut = (request, response) => {
  try {
    response.clearCookie("jwt");
    response.status(200).json({ message: "Logged out successfully !" });
  } catch (error) {
    console.error("Error in logOut controller:\n", error);
    response.status(500).json({ message: "Internal server error !" });
  }
};

const checkAuth = (request, response) => {
  try {
    response.status(200).json(request.user);
  } catch (error) {
    console.error("Error in checkAuth controller:\n", error);
    response.status(500).json({ message: "Internal server error !" });
  }
};

export { signIn, logIn, logOut, checkAuth };
