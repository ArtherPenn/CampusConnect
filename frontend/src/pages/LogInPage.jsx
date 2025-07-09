import { useAuthStore } from "../store/useAuthStore";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import "../App.css";

const LogInPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const { logIn, isLoggedIn } = useAuthStore();

  const formSubmit = (event) => {
    event.preventDefault();
    logIn(formData);
  };

  return (
    <div className="temp-container">
      <h2>LogInPage</h2>
      <form onSubmit={formSubmit} className="temp-form">
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
        <button type="submit" disabled={isLoggedIn}>
          {isLoggedIn ? (
            <>
              <Loader2 className="size-5 animate-spin" />
              Loading...
            </>
          ) : (
            "Log In"
          )}
        </button>

        <br />
        <p>
          Don&apos;t have an account?{" "}
          <Link to="/SignIn" className="text-blue-500">
            Create account
          </Link>
        </p>
      </form>
    </div>
  );
};

export default LogInPage;
