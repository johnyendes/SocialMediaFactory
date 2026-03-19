import { DefaultSession } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      preferences?: any;
    } & DefaultSession["user"];
  }

  interface User {
    role: string;
    preferences?: any;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: string;
    preferences?: any;
  }
}