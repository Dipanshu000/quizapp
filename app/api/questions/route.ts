import { NextResponse } from "next/server"

export async function GET() {
  try {
    const response = await fetch("https://opentdb.com/api.php?amount=15", {
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching questions:", error)
    return NextResponse.json({ error: "Failed to fetch questions" }, { status: 500 })
  }
}


// Main files are app/page.tsx, app/api/questions , app/quiz , app/results 