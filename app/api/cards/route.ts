import { createCard } from "@/lib/store"
import { NextResponse } from "next/server"
import { randomBytes } from "crypto"

export async function POST(req: Request) {
  const { recipientName } = await req.json()
  if (!recipientName) return NextResponse.json({ error: "Missing name" }, { status: 400 })

  const id = randomBytes(4).toString("hex")
  await createCard(id, recipientName)

  return NextResponse.json({ id })
}
