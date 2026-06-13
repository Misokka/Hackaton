import { userManager } from "@/lib/users/users";
import { NextResponse } from "next/server";

export async function GET() {
  try{
    const users = await userManager.getAllUsers();
    return NextResponse.json({
      message: "Cette route renvoie tous les utilisateurs",
      users: users
    })
  } catch (error: any) {
    return NextResponse.json({
      message: "Une erreur s'est produite lors de la récupération des utilisateurs",
      error: error.message
    }, { status: 500 })
  }
 
}

export async function POST(request: Request) {
  try {
    const {
      email,
      firstname,
      lastname,
      password,
      confirmationPassword
    } = await request.json();

    const createdUser = await userManager.createUser({
      email,
      firstname,
      lastname,
      password,
      confirmationPassword
    });

    return NextResponse.json({
      message: "Cette route permet de créer un nouvel utilisateur",
      user: createdUser
    });

  } catch (error: any) {
    return NextResponse.json({
      message: "Une erreur s'est produite lors de la création de l'utilisateur",
      error: error.message
    }, { status: 500 })
  }
  
}