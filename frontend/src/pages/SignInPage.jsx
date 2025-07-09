import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Link } from "react-router-dom";
import "../App.css";
import { toast } from "react-hot-toast";

const SignInPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const { signIn, isSigningIn } = useAuthStore();

  const validateForm = () => {
    const { name, email, password } = formData;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!name || !email || !password) {
      return toast.error("All fields are required.");
    }

    if (password.length < 6) {
      return toast.error("Password must be at least 6 characters long.");
    }

    if (!emailRegex.test(email)) {
      return toast.error("Please enter a valid email address.");
    }

    return true;
  };

  const formSubmit = (event) => {
    event.preventDefault();

    if (validateForm()) signIn(formData);
  };

  return (
    <div className="temp-container">
      <h2>SignInPage</h2>
      <form onSubmit={formSubmit} className="temp-form">
        <input
          type="text"
          placeholder="Username"
          required
          value={formData.username}
          onChange={(event) =>
            setFormData({ ...formData, name: event.target.value })
          }
        />

        <input
          type="email"
          placeholder="Email"
          required
          value={formData.email}
          onChange={(event) =>
            setFormData({ ...formData, email: event.target.value })
          }
        />

        <div className="password-input">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            required
            value={formData.password}
            onChange={(event) =>
              setFormData({ ...formData, password: event.target.value })
            }
          />
          <button type="button" onClick={() => setShowPassword(!showPassword)}>
            Show
          </button>
        </div>

        <br />
        <button type="submit" disabled={isSigningIn}>
          {isSigningIn ? (
            <>
              <Loader2 className="size-5 animate-spin" />
              Loading...
            </>
          ) : (
            "Create Account"
          )}
        </button>

        <br />
        <p>
          Already have an account?{" "}
          <Link to="/logIn" className="text-blue-500">
            Log In
          </Link>
        </p>
      </form>
    </div>
  );
};

export default SignInPage;
