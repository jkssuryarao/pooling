export interface Credential {
  employeeId: string;
  password: string;
  userId: string;
  role: "employee" | "admin";
  name: string;
  email: string;
}

export const SEED_CREDENTIALS: Credential[] = [
  {
    employeeId: "employee",
    password: "RideShare@2025",
    userId: "user-demo",
    role: "employee",
    name: "Priya Joshi",
    email: "priya.joshi@tally.com",
  },
  {
    employeeId: "EMP-0012",
    password: "RideShare@2025",
    userId: "user-demo",
    role: "employee",
    name: "Priya Joshi",
    email: "priya.joshi@tally.com",
  },
  {
    employeeId: "EMP-0042",
    password: "RideShare@2025",
    userId: "user-rahul",
    role: "employee",
    name: "Rahul Kumar",
    email: "rahul.kumar@tally.com",
  },
  {
    employeeId: "EMP-0003",
    password: "RideShare@2025",
    userId: "user-sunita",
    role: "employee",
    name: "Sunita Acharya",
    email: "sunita.acharya@tally.com",
  },
  {
    employeeId: "admin",
    password: "Admin@2025",
    userId: "user-admin",
    role: "admin",
    name: "Anita Sharma",
    email: "anita.sharma@tally.com",
  },
  {
    employeeId: "EMP-0099",
    password: "Admin@2025",
    userId: "user-admin",
    role: "admin",
    name: "Anita Sharma",
    email: "anita.sharma@tally.com",
  },
];
