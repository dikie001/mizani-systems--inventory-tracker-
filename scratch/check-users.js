import prisma from "../lib/prisma.js";

async function main() {
  const users = await prisma.user.findMany({
    take: 10,
    select: { id: true, email: true }
  });
  console.log("Existing users in DB:", JSON.stringify(users, null, 2));
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
