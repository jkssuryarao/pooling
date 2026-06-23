import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { CURRENT_USER_ID, ADMIN_USER_ID } from "@/lib/mock/seed";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        employeeId: { label: "Employee ID", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const id = credentials?.employeeId?.trim().toLowerCase();
        const pass = credentials?.password;

        const employeeUser = process.env.AUTH_EMPLOYEE_USER || "employee";
        const employeePass = process.env.AUTH_EMPLOYEE_PASS || "RideShare@2025";
        const adminUser = process.env.AUTH_ADMIN_USER || "admin";
        const adminPass = process.env.AUTH_ADMIN_PASS || "Admin@2025";

        if (id === employeeUser.toLowerCase() && pass === employeePass) {
          return {
            id: CURRENT_USER_ID,
            name: "Priya Joshi",
            email: "priya.joshi@tally.com",
            role: "employee",
          };
        }
        if (id === adminUser.toLowerCase() && pass === adminPass) {
          return {
            id: ADMIN_USER_ID,
            name: "Anita Sharma",
            email: "anita.sharma@tally.com",
            role: "admin",
          };
        }
        return null;
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role;
        token.userId = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { role?: string }).role = token.role as string;
        (session.user as { id?: string }).id = token.userId as string;
      }
      return session;
    },
  },
};
