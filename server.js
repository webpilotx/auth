import bcrypt from "bcryptjs";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import "dotenv/config";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/libsql";
import express from "express";
import { SignJWT } from "jose";
import ViteExpress from "vite-express";
import { usersTable } from "./schema.js";
import fetch from "node-fetch";

const db = drizzle(process.env.DB_FILE_NAME);
const PORT = process.env.PORT || 3000;

const app = express();
app.use(bodyParser.json());
app.use(cookieParser());

const JWT_SECRET = Buffer.from(process.env.JWT_SECRET, "hex");
const JWT_EXPIRATION = "30d";
const TURNSTILE_SECRET_KEY = process.env.TURNSTILE_SECRET_KEY;

async function verifyTurnstileToken(token) {
  const response = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        secret: TURNSTILE_SECRET_KEY,
        response: token,
      }),
    }
  );
  const data = await response.json();
  return data.success;
}

app.post("/auth/api/register", async (req, res) => {
  const { username, password, confirmPassword, turnstileToken } = req.body;

  if (!turnstileToken || !(await verifyTurnstileToken(turnstileToken))) {
    return res.status(400).send("Turnstile verification failed.");
  }

  if (!username || username.length < 3 || username.length > 20) {
    return res
      .status(400)
      .send("Username must be between 3 and 20 characters long.");
  }

  if (
    !password ||
    password.length < 8 ||
    !/[A-Z]/.test(password) ||
    !/[a-z]/.test(password) ||
    !/[0-9]/.test(password)
  ) {
    return res
      .status(400)
      .send(
        "Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, and one number."
      );
  }

  if (password !== confirmPassword) {
    return res.status(400).send("Passwords do not match.");
  }

  const [existingUser] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.username, username));
  if (existingUser) {
    return res.status(400).send("User already exists.");
  }

  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  await db.insert(usersTable).values({ username, passwordHash });

  const token = await new SignJWT({ username })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(JWT_EXPIRATION)
    .sign(JWT_SECRET);

  res.status(201).json({ message: "User registered successfully.", token });
});

app.post("/auth/api/login", async (req, res) => {
  const { username, password, turnstileToken } = req.body;

  if (!turnstileToken || !(await verifyTurnstileToken(turnstileToken))) {
    return res.status(400).send("Turnstile verification failed.");
  }

  if (!username || !password) {
    return res.status(400).send("Username and password are required.");
  }

  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.username, username));
  if (!user) {
    return res.status(401).send("Invalid username or password.");
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

  if (!isPasswordValid) {
    return res.status(401).send("Invalid username or password.");
  }

  const token = await new SignJWT({ username })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(JWT_EXPIRATION)
    .sign(JWT_SECRET);

  res.json({ token });
});

ViteExpress.listen(app, PORT, () =>
  console.log(`Server is listening on port ${PORT}`)
);
