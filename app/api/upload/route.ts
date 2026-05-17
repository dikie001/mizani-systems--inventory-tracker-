import { NextResponse } from "next/server"
import { auth } from "@/auth"

export async function POST(request: Request) {
  const session = await auth()
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get("file") as File | null
    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 })
    }

    const buffer = await file.arrayBuffer()
    const base64File = Buffer.from(buffer).toString("base64")

    // Prepare ImageKit payload
    const imageKitFormData = new FormData()
    imageKitFormData.append("file", base64File)
    imageKitFormData.append("fileName", file.name)
    imageKitFormData.append("folder", "/products")

    const privateKey = process.env.IMAGE_KIT_SECRET_KEY || ""
    const authHeader = `Basic ${Buffer.from(privateKey + ":").toString("base64")}`

    const res = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
      method: "POST",
      headers: {
        Authorization: authHeader,
      },
      body: imageKitFormData,
    })

    if (!res.ok) {
      const errText = await res.text()
      console.error("ImageKit error response:", errText)
      return NextResponse.json({ error: "Failed to upload to ImageKit" }, { status: 502 })
    }

    const data = await res.json()
    return NextResponse.json({ url: data.url })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
