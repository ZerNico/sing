import { users } from "database";
import { type InferSelectModel, eq } from "drizzle-orm";
import { SignJWT, jwtVerify } from "jose";
import * as v from "valibot";
import { config } from "../config";
import { db } from "./db";

const jwtPayloadSchema = v.object({
  sub: v.pipe(
    v.string(),
    v.transform((sub) => Number.parseInt(sub)),
    v.number(),
  ),
  iat: v.number(),
  exp: v.number(),
  iss: v.literal("api"),
  aud: v.literal("api"),
});

class AuthService {
  private secret = new TextEncoder().encode(config.API_JWT_SECRET);

  async register({ username, password }: { username: string; password: string }) {
    try {
      const hashedPassword = await Bun.password.hash(password);
      const [user] = await db.insert(users).values({ username, password: hashedPassword }).returning();

      if (!user) {
        throw new Error("Failed to register user");
      }

      return user;
    } catch (error) {
      return null;
    }
  }

  async login({ username, password }: { username: string; password: string }) {
    const user = (await db.select().from(users).where(eq(users.username, username)))[0];

    if (!user) {
      return null;
    }

    const isValid = await Bun.password.verify(password, user.password);

    if (!isValid) {
      return null;
    }

    return user;
  }

  async createJwt(user: InferSelectModel<typeof users>) {
    const jwt = await new SignJWT()
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setIssuer("api")
      .setAudience("api")
      .setExpirationTime("1w")
      .setSubject(user.id.toString())
      .sign(this.secret);

    return jwt;
  }

  async verifyJwt(jwt: string) {
    try {
      const { payload } = await jwtVerify(jwt, this.secret, { issuer: "api", audience: "api" });

      return v.parse(jwtPayloadSchema, payload);
    } catch (error) {
      return null;
    }
  }
}

export const authService = new AuthService();
