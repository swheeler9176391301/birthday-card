"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function Home() {
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function createCard() {
    if (!name.trim()) return
    setLoading(true)
    const res = await fetch("/api/cards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recipientName: name }),
    })
    const { id } = await res.json()
    router.push(`/card/${id}`)
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-pink-50 gap-6 p-8">
      <h1 className="text-4xl font-bold text-pink-600">🎂 Birthday Card Creator</h1>
      <p className="text-gray-500">Enter the birthday person&apos;s name to create a shareable card.</p>
      <div className="flex gap-3">
        <input
          className="border border-pink-300 rounded-lg px-4 py-2 text-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
          placeholder="Their first name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && createCard()}
        />
        <button
          onClick={createCard}
          disabled={loading}
          className="bg-pink-500 hover:bg-pink-600 text-white font-semibold px-6 py-2 rounded-lg disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create Card"}
        </button>
      </div>
    </main>
  )
}
