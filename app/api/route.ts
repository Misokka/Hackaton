import { NextResponse } from "next/server";

// accède à la route avec l'url : http://localhost:3000/api/
export function GET() {
  return NextResponse.json({ message: "Hello from the API route!" });
}