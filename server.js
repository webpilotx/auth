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

const db = drizzle(process.env.DB_FILE_NAME);

const app = express();
app.use(bodyParser.json());
app.use(cookieParser());

const JWT_SECRET = Buffer.from(process.env.JWT_SECRET, "hex");
const JWT_EXPIRATION = "30d";

app.post("/auth/api/register", async (req, res) => {
  const { username, password, confirmPassword } = req.body;
  if (!username || !password || !confirmPassword) {
    return res.status(400).send("All fields are required.");
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

  res.status(201).json({ message: "User registered successfully.", token }); // Return JWT
});

app.post("/auth/api/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).send("All fields are required.");
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

ViteExpress.listen(app, 3000, () => console.log("Server is listening..."));
