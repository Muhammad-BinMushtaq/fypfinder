import { NextResponse } from "next/server"

export const runtime = "nodejs"

export async function POST() {
  return NextResponse.json(
    {
      success: false,
      message: "PDF upload functionality is currently under development. Please use the manual submission form.",
    },
    { status: 501 }
  )
}
