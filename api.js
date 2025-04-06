import bcrypt from "bcryptjs";
import bodyParser from "body-parser";
import "dotenv/config";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/libsql";
import express from "express";
import fs from "fs";
import { importPKCS8, SignJWT } from "jose";
import fetch from "node-fetch";
import { usersTable } from "./schema.js";

const db = drizzle(process.env.DB_FILE_NAME);

const app = express();
app.use(bodyParser.json());

const JWT_EXPIRATION = "30d";
const TURNSTILE_SECRET_KEY = process.env.TURNSTILE_SECRET_KEY;

const PRIVATE_KEY = await importPKCS8(
  fs.readFileSync(process.env.PRIVATE_KEY_PATH, "utf8"),
  "RS256"
);

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

  if (!response.ok) {
    throw new Error(`Turnstile verification failed: ${response.statusText}`);
  }

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

  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  try {
    await db.insert(usersTable).values({ username, passwordHash });

    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.username, username));

    const token = await new SignJWT({
      username,
      createdAt: user.createdAt,
    })
      .setProtectedHeader({ alg: "RS256" })
      .setExpirationTime(JWT_EXPIRATION)
      .sign(PRIVATE_KEY);

    res.status(201).json({ message: "User registered successfully.", token });
  } catch (error) {
    if (error.message.includes("UNIQUE constraint failed:")) {
      return res.status(400).send("Username already exists.");
    }
    throw error;
  }
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

  const token = await new SignJWT({
    username,
    createdAt: user.createdAt,
  })
    .setProtectedHeader({ alg: "RS256" })
    .setExpirationTime(JWT_EXPIRATION)
    .sign(PRIVATE_KEY);

  res.json({ token });
});

export default app;
