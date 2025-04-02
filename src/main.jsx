import { StrictMode, useCallback, useState } from "react";
import { createRoot } from "react-dom/client";
import Turnstile from "react-turnstile";
import "./index.css";

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

function Button({ children, onClick, type = "button", className }) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${className}`}
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!turnstileToken) {
      setMessage("Please complete the Turnstile verification.");
      setMessageType("error");
      return;
    }

    if (!formData.username || !formData.password) {
      setMessage("Username and password are required.");
      setMessageType("error");
      return;
    }

    fetch("/auth/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...formData, turnstileToken }),
    })
      .then((response) => {
        if (!response.ok) {
          return response.text().then((text) => {
            setMessage(text);
            setMessageType("error");
          });
        }
        return response.json();
      })
      .then((data) => {
        if (data && data.token) {
          localStorage.setItem("token", data.token);
          window.location.href = "/";
        }
      });
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
        <Button type="submit">Login</Button>
      </form>
      {message && <Alert message={message} type={messageType} />}
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!turnstileToken) {
      setMessage("Please complete the Turnstile verification.");
      setMessageType("error");
      return;
    }

    if (formData.username.length < 3 || formData.username.length > 20) {
      setMessage("Username must be between 3 and 20 characters long.");
      setMessageType("error");
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
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setMessage("Passwords do not match.");
      setMessageType("error");
      return;
    }

    fetch("/auth/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...formData, turnstileToken }),
    })
      .then((response) => {
        if (!response.ok) {
          return response.text().then((text) => {
            setMessage(text);
            setMessageType("error");
          });
        }
        return response.json();
      })
      .then((data) => {
        if (data && data.token) {
          localStorage.setItem("token", data.token);
          window.location.href = "/";
        }
      });
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
        <Button type="submit">Register</Button>
      </form>
      {message && <Alert message={message} type={messageType} />}
    </div>
  );
}

function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="w-full max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md space-y-6">
      {isLogin ? <LoginForm /> : <RegisterForm />}
      <p className="text-center text-sm text-gray-600">
        {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
        <button
          onClick={() => setIsLogin(!isLogin)}
          className="text-blue-600 hover:underline"
        >
          {isLogin ? "Register" : "Login"}
        </button>
      </p>
    </div>
  );
}

function App() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <AuthPage />
    </div>
  );
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
