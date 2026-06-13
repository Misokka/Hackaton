import { NextResponse } from "next/server";

export async function GET(_req: Request, { params }: {params: Promise<{id: string}>}){
  const { id } = await params;
  return NextResponse.json({
    message: "Cette route renvoie un utilisateur spécifique",
    userId: id
  })
}