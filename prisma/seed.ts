import prisma from "../lib/prisma"

async function main() {
  console.log("Seeding database...")

  // Clean existing data (optional but good for dev)
  await prisma.auditLog.deleteMany()
  await prisma.stockMovement.deleteMany()
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.product.deleteMany()
  await prisma.category.deleteMany()

  await prisma.account.deleteMany()
  await prisma.session.deleteMany()
  await prisma.user.deleteMany()

  // 1. Create Users
  const user = await prisma.user.create({
    data: {
      name: "Alex Johnson",
      email: "alex@company.com",
      role: "owner",
    },
  })

  // 2. Create Categories
  const categories = [
    "Electronics",
    "Apparel",
    "Food & Bev",
    "Home",
    "Sports",
    "Beauty",
  ]
  const catMap = new Map()
  for (const name of categories) {
    const c = await prisma.category.create({ data: { name } })
    catMap.set(name, c.id)
  }



  // 4. Create Products
  const productsData = [
    { name: "Wireless Earbuds Pro", sku: "WEP-2024-BK", categoryId: catMap.get("Electronics"), price: 79.99, stock: 342, status: "in-stock" },
    { name: "Organic Coffee Beans 1kg", sku: "OCB-1KG-AR", categoryId: catMap.get("Food & Bev"), price: 24.50, stock: 189, status: "in-stock" },
    { name: "Running Shoes V2", sku: "RSV2-42-BL", categoryId: catMap.get("Sports"), price: 129.99, stock: 67, status: "low-stock" },
    { name: "Smart Watch Elite", sku: "SWE-2024-SL", categoryId: catMap.get("Electronics"), price: 299.99, stock: 156, status: "in-stock" },
    { name: "Yoga Mat Premium", sku: "YMP-BL-6MM", categoryId: catMap.get("Sports"), price: 45.00, stock: 8, status: "critical" },
    { name: "USB-C Hub Adapter", sku: "UCH-7P-GR", categoryId: catMap.get("Electronics"), price: 49.99, stock: 12, status: "low-stock" },
    { name: "Face Serum 30ml", sku: "FS-30-HY", categoryId: catMap.get("Beauty"), price: 34.99, stock: 15, status: "low-stock" },
    { name: "Bamboo Cutting Board", sku: "BCB-LG-NT", categoryId: catMap.get("Home"), price: 28.00, stock: 5, status: "critical" },
  ]

  const createdProducts = []
  for (const p of productsData) {
    const product = await prisma.product.create({ data: p })
    createdProducts.push(product)
  }

  // 5. Create Orders
  const orders = [
    { customer: "Acme Corp", total: 1249.88, status: "delivered", payment: "paid" },
    { customer: "TechStart Inc", total: 649.95, status: "shipped", payment: "paid" },
    { customer: "GreenLeaf Ltd", total: 392.00, status: "processing", payment: "paid" },
    { customer: "Bright Solutions", total: 899.97, status: "pending", payment: "unpaid" },
  ]

  for (const o of orders) {
    await prisma.order.create({
      data: {
        ...o,
        orderItems: {
          create: [
            {
              productId: createdProducts[0].id,
              quantity: 2,
              price: createdProducts[0].price,
            },
            {
              productId: createdProducts[1].id,
              quantity: 1,
              price: createdProducts[1].price,
            }
          ]
        }
      }
    })
  }

  // 6. Create Stock Movements
  await prisma.stockMovement.create({
    data: {
      productId: createdProducts[0].id,
      userId: user.id,
      type: "Restock",
      quantity: 250,
      status: "completed",
    }
  })
  
  await prisma.stockMovement.create({
    data: {
      productId: createdProducts[1].id,
      userId: user.id,
      type: "Sale",
      quantity: -48,
      status: "completed",
    }
  })

  // 7. Create Audit Logs
  await prisma.auditLog.create({
    data: {
      action: "Product Created",
      entity: "Wireless Earbuds Pro",
      type: "create",
      userId: user.id,
      ip: "192.168.1.42",
    }
  })

  console.log("Seeding complete!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
