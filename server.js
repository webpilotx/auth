import express from "express";
import ViteExpress from "vite-express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import { SignJWT, jwtVerify } from "jose";

const app = express();
app.use(bodyParser.json());
app.use(cookieParser());

const users = {}; // In-memory user store (use a database in production)
const JWT_SECRET = new TextEncoder().encode("your-secret-key"); // Replace with a secure key
const JWT_EXPIRATION = "1h";

app.post("/auth/api/register", async (req, res) => {
  const { username, password, confirmPassword } = req.body;
  if (!username || !password || !confirmPassword) {
    return res.status(400).send("All fields are required.");
  }
  if (password !== confirmPassword) {
    return res.status(400).send("Passwords do not match.");
  }
  if (users[username]) {
    return res.status(400).send("User already exists.");
  }
  users[username] = { password }; // Store user (hash passwords in production)
  res.status(201).send("User registered successfully.");
});

app.post("/auth/api/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).send("All fields are required.");
  }
  const user = users[username];
  if (!user || user.password !== password) {
    return res.status(401).send("Invalid username or password.");
  }
  const token = await new SignJWT({ username })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(JWT_EXPIRATION)
    .sign(JWT_SECRET);
  res.cookie("token", token, { httpOnly: true, secure: true });
  res.send("Login successful.");
});

app.get("/auth/message", async (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).send("Unauthorized.");
  }
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    res.send(`Hello, ${payload.username}!`);
  } catch {
    res.status(401).send("Invalid or expired token.");
  }
});

ViteExpress.listen(app, 3000, () => console.log("Server is listening..."));
