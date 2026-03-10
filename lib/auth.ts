import Database from "better-sqlite3";
import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";

const authDb = new Database("data/oddparty.sqlite");
authDb.exec(`
  CREATE TABLE IF NOT EXISTS user (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    emailVerified INTEGER NOT NULL,
    image TEXT,
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS session (
    id TEXT PRIMARY KEY,
    expiresAt TEXT NOT NULL,
    token TEXT NOT NULL UNIQUE,
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL,
    ipAddress TEXT,
    userAgent TEXT,
    userId TEXT NOT NULL,
    FOREIGN KEY(userId) REFERENCES user(id)
  );

  CREATE TABLE IF NOT EXISTS account (
    id TEXT PRIMARY KEY,
    accountId TEXT NOT NULL,
    providerId TEXT NOT NULL,
    userId TEXT NOT NULL,
    accessToken TEXT,
    refreshToken TEXT,
    idToken TEXT,
    accessTokenExpiresAt TEXT,
    refreshTokenExpiresAt TEXT,
    scope TEXT,
    password TEXT,
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL,
    FOREIGN KEY(userId) REFERENCES user(id)
  );

  CREATE TABLE IF NOT EXISTS verification (
    id TEXT PRIMARY KEY,
    identifier TEXT NOT NULL,
    value TEXT NOT NULL,
    expiresAt TEXT NOT NULL,
    createdAt TEXT,
    updatedAt TEXT
  );
`);

export const auth = betterAuth({
  database: authDb,
  secret: process.env.BETTER_AUTH_SECRET ?? "oddparty-local-development-secret-change-in-prod",
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false
  },
  plugins: [nextCookies()]
});
