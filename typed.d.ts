import { DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session {
    user?: DefaultUser & {
      id: string;
      email: string;
    };
  }
  interface User extends DefaultUser {
    id: string;
    email: string;
  }
}
