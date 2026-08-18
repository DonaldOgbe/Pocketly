import { PrismaPg } from "@prisma/adapter-pg";
import { DATABASE_URL } from "./env.js";
import { PrismaClient } from "./generated/prisma/client.js";

const adapter = new PrismaPg({ connectionString: DATABASE_URL });

// One client per process means one connection pool. Import this, never
// construct PrismaClient anywhere else.
const prisma = new PrismaClient({ adapter });

export default prisma;
