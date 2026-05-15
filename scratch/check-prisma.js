import prisma from "../lib/prisma.js";

async function main() {
  console.log("Checking prisma.workspace...");
  if (prisma.workspace) {
    console.log("prisma.workspace is defined!");
  } else {
    console.log("prisma.workspace is UNDEFINED.");
  }
  
  console.log("Available models on prisma:", Object.keys(prisma).filter(k => !k.startsWith("$") && !k.startsWith("_")));
  
  try {
    await prisma.$transaction(async (tx) => {
      console.log("Checking tx.workspace...");
      if (tx.workspace) {
        console.log("tx.workspace is defined!");
      } else {
        console.log("tx.workspace is UNDEFINED.");
      }
      console.log("Available models on tx:", Object.keys(tx).filter(k => !k.startsWith("$") && !k.startsWith("_")));
    });
  } catch (e) {
    console.log("Transaction error:", e.message);
  }
  
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
