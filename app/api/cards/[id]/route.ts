import { getCard } from "@/lib/store"
import { NextResponse } from "next/server"

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const card = await getCard(id)
  if (!card) return NextResponse.json({ error: "Card not found" }, { status: 404 })
  return NextResponse.json(card)
}
