import { useCallback, useState } from "react";
import {
  HashRouter as Router,
  Routes,
  Route,
  Link,
  useNavigate,
  useSearchParams,
  Navigate,
} from "react-router-dom";
import Turnstile from "react-turnstile";
import "./index.css";

function Navbar() {
  return (
    <nav className="bg-blue-600 text-white py-4">
      <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
        <button
          onClick={() => (window.location.href = "/")}
          className="bg-white text-blue-600 px-4 py-2 rounded-md hover:bg-gray-100"
        >
          Home
        </button>
      </div>
    </nav>
  );
}

function Input({ label, type, name, value, onChange, required }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        required={required}
      />
    </div>
  );
}

function Button({ children, onClick, type = "button", className, disabled }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      } ${className}`}
    >
      {children}
    </button>
  );
}

function Alert({ message, type = "error" }) {
  const alertStyles =
    type === "error"
      ? "text-red-700 bg-red-100 border border-red-400"
      : "text-green-700 bg-green-100 border border-green-400";
  return (
    <p
      className={`mt-4 text-center text-sm p-2 rounded-md ${alertStyles}`}
      role="alert"
    >
      {message}
    </p>
  );
}

function LoginForm() {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("error");
  const [turnstileToken, setTurnstileToken] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!turnstileToken) {
      setMessage("Please complete the Turnstile verification.");
      setMessageType("error");
      setIsSubmitting(false);
      return;
    }

    if (!formData.username || !formData.password) {
      setMessage("Username and password are required.");
      setMessageType("error");
      setIsSubmitting(false);
      return;
    }

    const response = await fetch("/auth/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...formData, turnstileToken }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      setMessage(errorText);
      setMessageType("error");
      setIsSubmitting(false);
      return;
    }

    const data = await response.json();
    localStorage.setItem("token", data.token);
    const redirectTo = searchParams.get("redirectTo") || "/";
    navigate(redirectTo);
  };

  const handleTurnstileVerify = useCallback((token) => {
    setTurnstileToken(token);
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-center">Login</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Username"
          type="text"
          name="username"
          value={formData.username}
          onChange={handleInputChange}
          required
        />
        <Input
          label="Password"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleInputChange}
          required
        />
        <div className="flex justify-center">
          <Turnstile
            sitekey={import.meta.env.VITE_TURNSTILE_SITEKEY}
            onVerify={handleTurnstileVerify}
          />
        </div>
        <Button type="submit" disabled={!turnstileToken || isSubmitting}>
          {isSubmitting ? "Submitting..." : "Login"}
        </Button>
      </form>
      {message && <Alert message={message} type={messageType} />}
      <p className="text-center text-sm text-gray-600">
        Don't have an account?{" "}
        <Link to="/register" className="text-blue-600 hover:underline">
          Register
        </Link>
      </p>
    </div>
  );
}

function RegisterForm() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
  });
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("error");
  const [turnstileToken, setTurnstileToken] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!turnstileToken) {
      setMessage("Please complete the Turnstile verification.");
      setMessageType("error");
      setIsSubmitting(false);
      return;
    }

    if (formData.username.length < 3 || formData.username.length > 20) {
      setMessage("Username must be between 3 and 20 characters long.");
      setMessageType("error");
      setIsSubmitting(false);
      return;
    }
    if (
      formData.password.length < 8 ||
      !/[A-Z]/.test(formData.password) ||
      !/[a-z]/.test(formData.password) ||
      !/[0-9]/.test(formData.password)
    ) {
      setMessage(
        "Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, and one number."
      );
      setMessageType("error");
      setIsSubmitting(false);
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setMessage("Passwords do not match.");
      setMessageType("error");
      setIsSubmitting(false);
      return;
    }

    const response = await fetch("/auth/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...formData, turnstileToken }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      if (errorText.includes("Username already exists")) {
        setMessage("This username is already taken.");
      } else {
        setMessage(errorText);
      }
      setMessageType("error");
      setIsSubmitting(false);
      return;
    }

    const data = await response.json();
    localStorage.setItem("token", data.token);
    const redirectTo = searchParams.get("redirectTo") || "/";
    navigate(redirectTo);
  };

  const handleTurnstileVerify = useCallback((token) => {
    setTurnstileToken(token);
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-center">Register</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Username"
          type="text"
          name="username"
          value={formData.username}
          onChange={handleInputChange}
          required
        />
        <Input
          label="Password"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleInputChange}
          required
        />
        <Input
          label="Confirm Password"
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleInputChange}
          required
        />
        <div className="flex justify-center">
          <Turnstile
            sitekey={import.meta.env.VITE_TURNSTILE_SITEKEY}
            onVerify={handleTurnstileVerify}
          />
        </div>
        <Button type="submit" disabled={!turnstileToken || isSubmitting}>
          {isSubmitting ? "Submitting..." : "Register"}
        </Button>
      </form>
      {message && <Alert message={message} type={messageType} />}
      <p className="text-center text-sm text-gray-600">
        Already have an account?{" "}
        <Link to="/login" className="text-blue-600 hover:underline">
          Login
        </Link>
      </p>
    </div>
  );
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center mt-10">
          {" "}
          {/* Added mt-10 for gap */}
          <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
            <Routes>
              <Route path="/login" element={<LoginForm />} />
              <Route path="/register" element={<RegisterForm />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;
