import { DefaultSession } from "next-auth"
import { User } from "./types"
declare module "next-auth" {
  interface Session {
    accessToken: string
    user: User
  }
}