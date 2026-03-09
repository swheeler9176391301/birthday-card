"use client"
import { useEffect, useState } from "react"
import { useParams } from "next/navigation"

type Message = { id: string; signer: string; text: string }
type Card = { recipientName: string; messages: Message[] }

const CONFETTI = ["🎉", "⭐", "🌟", "💛", "🩷", "🎈", "✨", "💜", "🩵", "🎊", "❤️", "💚"]
const POSITIONS = [
  { top: "6%",  left: "4%"  }, { top: "12%", left: "88%" },
  { top: "22%", left: "92%" }, { top: "4%",  left: "55%" },
  { top: "30%", left: "8%"  }, { top: "40%", left: "95%" },
  { top: "55%", left: "3%"  }, { top: "60%", left: "90%" },
  { top: "72%", left: "6%"  }, { top: "78%", left: "85%" },
  { top: "88%", left: "10%" }, { top: "92%", left: "70%" },
]

export default function CardPage() {
  const { id } = useParams()
  const [card, setCard] = useState<Card | null>(null)
  const [signer, setSigner] = useState("")
  const [text, setText] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [copied, setCopied] = useState(false)
  const [signError, setSignError] = useState("")
  const [notFound, setNotFound] = useState(false)
  const [signing, setSigning] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editText, setEditText] = useState("")

  async function fetchCard() {
    const res = await fetch(`/api/cards/${id}`)
    if (res.ok) setCard(await res.json())
    else if (res.status === 404) setNotFound(true)
  }

  useEffect(() => {
    fetchCard()
    const interval = setInterval(fetchCard, 5000)
    return () => clearInterval(interval)
  }, [id])

  async function deleteMsg(msgId: string) {
    if (!confirm("Delete this message?")) return
    await fetch(`/api/cards/${id}/messages/${msgId}`, { method: "DELETE" })
    fetchCard()
  }

  async function saveEdit(msgId: string) {
    if (!editText.trim()) return
    await fetch(`/api/cards/${id}/messages/${msgId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: editText }),
    })
    setEditingId(null)
    fetchCard()
  }

  async function sign() {
    if (!signer.trim() || !text.trim() || signing) return
    setSigning(true)
    setSignError("")
    const res = await fetch(`/api/cards/${id}/sign`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ signer, text }),
    })
    if (res.ok) {
      setSubmitted(true)
      fetchCard()
    } else {
      const data = await res.json()
      setSignError(data.error || "Something went wrong. Please try again.")
      setSigning(false)
    }
  }

  function copyLink() {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (notFound) return <div className="min-h-screen flex items-center justify-center text-gray-400">Card not found.</div>
  if (!card) return <div className="min-h-screen flex items-center justify-center text-gray-400">Loading...</div>

  return (
    <main className="min-h-screen flex flex-col items-center py-12 px-4 gap-8" style={{ background: "#fdf0f5" }}>

      {/* The Card */}
      <div
        className="relative rounded-3xl shadow-2xl max-w-md w-full overflow-hidden"
        style={{ background: "linear-gradient(145deg, #e8445a, #f06292)", minHeight: 420 }}
      >
        {/* Scattered confetti */}
        {CONFETTI.map((emoji, i) => (
          <span
            key={i}
            className="absolute text-xl select-none pointer-events-none"
            style={{ ...POSITIONS[i], opacity: 0.85 }}
          >
            {emoji}
          </span>
        ))}

        {/* Card content */}
        <div className="relative z-10 flex flex-col items-center px-8 pt-10 pb-8 gap-4">
          {/* Happy Birthday text */}
          <div className="text-center leading-none mb-2">
            <div
              className="font-black uppercase tracking-widest"
              style={{
                fontSize: "clamp(2.2rem, 8vw, 3.2rem)",
                color: "#fff",
                textShadow: "3px 3px 0 #c2185b, -1px -1px 0 #c2185b",
                WebkitTextStroke: "1.5px #c2185b",
              }}
            >
              Happy
            </div>
            <div
              className="font-black uppercase tracking-widest"
              style={{
                fontSize: "clamp(2.8rem, 10vw, 4.2rem)",
                color: "#ffd6e7",
                textShadow: "4px 4px 0 #ad1457, -2px -2px 0 #ad1457",
                WebkitTextStroke: "2px #ad1457",
                lineHeight: 1,
              }}
            >
              Birthday
            </div>
          </div>

          {/* Name */}
          <div
            className="font-bold text-white text-2xl"
            style={{ textShadow: "1px 2px 4px rgba(0,0,0,0.25)" }}
          >
            {card.recipientName}! 🎂
          </div>

          {/* Messages */}
          {card.messages.length > 0 && (
            <div className="w-full flex flex-col gap-3 mt-2">
              {card.messages.map((m, i) => (
                <div
                  key={m.id ?? i}
                  className="rounded-2xl px-4 py-3 text-left"
                  style={{ background: "rgba(255,255,255,0.2)", backdropFilter: "blur(4px)" }}
                >
                  <div className="flex justify-between items-center">
                    <p className="font-bold text-white text-sm">{m.signer}</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => { setEditingId(m.id); setEditText(m.text) }}
                        className="text-white opacity-70 hover:opacity-100 text-xs"
                      >✏️</button>
                      <button
                        onClick={() => deleteMsg(m.id)}
                        className="text-white opacity-70 hover:opacity-100 text-xs"
                      >🗑️</button>
                    </div>
                  </div>
                  {editingId === m.id ? (
                    <div className="mt-1 flex flex-col gap-1">
                      <textarea
                        className="w-full rounded-lg px-2 py-1 text-sm text-gray-700 resize-none"
                        rows={2}
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                      />
                      <div className="flex gap-2">
                        <button onClick={() => saveEdit(m.id)} className="text-xs bg-white text-pink-600 font-semibold px-3 py-1 rounded-lg">Save</button>
                        <button onClick={() => setEditingId(null)} className="text-xs text-white opacity-70">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-pink-100 text-sm mt-0.5">{m.text}</p>
                  )}
                </div>
              ))}
            </div>
          )}

          {card.messages.length === 0 && (
            <p className="text-pink-200 italic text-sm">No messages yet — be the first to sign!</p>
          )}
        </div>
      </div>

      {/* Share link */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-400">Share with coworkers to sign:</span>
        <button
          onClick={copyLink}
          className="text-sm font-medium px-4 py-1.5 rounded-lg transition-colors"
          style={{ background: "#fce4ec", color: "#e91e8c" }}
        >
          {copied ? "Copied!" : "Copy Link"}
        </button>
      </div>

      {/* Sign form */}
      {!submitted ? (
        <div className="bg-white rounded-2xl shadow-md p-6 max-w-md w-full flex flex-col gap-4 border border-pink-100">
          <h2 className="font-bold text-gray-700 text-lg">✍️ Sign the card</h2>
          <input
            className="border border-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-300"
            placeholder="Your name"
            value={signer}
            onChange={(e) => setSigner(e.target.value)}
          />
          <textarea
            className="border border-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-300 resize-none"
            placeholder="Write a birthday message..."
            rows={3}
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          {signError && <p className="text-red-500 text-sm">{signError}</p>}
          <button
            onClick={sign}
            disabled={signing}
            className="text-white font-bold py-2.5 rounded-xl transition-colors disabled:opacity-50"
            style={{ background: "linear-gradient(90deg, #e8445a, #f06292)" }}
          >
            {signing ? "Signing..." : "Sign Card 🎉"}
          </button>
        </div>
      ) : (
        <div className="text-center">
          <p className="text-2xl">🎉</p>
          <p className="font-semibold text-pink-500">You signed the card!</p>
        </div>
      )}
    </main>
  )
}
