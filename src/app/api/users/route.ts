import dbConnect from "@/db/db";
import { UserModel } from "@/db/model/user";
import { NextResponse } from "next/server";

// ✅ POST /api/users → Register User
export async function POST(req: Request) {
  await dbConnect();
  try {
    const body = await req.json();
    const { name, email, password, role, phone, address, avatar } = body;

    // Check if user exists
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { message: "Email already registered!" },
        { status: 400 }
      );
    }

    const user = new UserModel({
      name,
      email,
      password,
      role,
      phone,
      address,
      avatar,
    });
    await user.save();

    return NextResponse.json(
      { message: "User registered successfully", user },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

// ✅ GET /api/users → Get all users
export async function GET() {
  await dbConnect();
  try {
    const users = await UserModel.find().select("-password");
    return NextResponse.json({ users });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
