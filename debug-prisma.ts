import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import pg from "pg"
import dotenv from "dotenv"

dotenv.config()

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  try {
    const slug = "test-workspace"
    const workspace = await prisma.workspace.create({
      data: {
        name: "Test Workspace",
        slug: `${slug}-${Math.random().toString(36).substring(2, 7)}`,
        businessType: "retail",
        inventorySize: "small",
        goals: ["tracking"],
      },
    })
    console.log("Success:", workspace)
  } catch (error) {
    console.error("Full Error:", error)
  } finally {
    await prisma.$disconnect()
    await pool.end()
  }
}

main()
