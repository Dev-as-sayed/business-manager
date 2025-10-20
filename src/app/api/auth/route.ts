import dbConnect from "@/db/db";
import { UserModel } from "@/db/model/user";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { signToken } from "@/lib/jwt";

export async function POST(req: Request) {
  await dbConnect();

  try {
    const { email, password } = await req.json();
    const user = await UserModel.findOne({ email });

    if (!user)
      return NextResponse.json({ message: "User not found" }, { status: 404 });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );

    // 🧠 Create JWT Token
    const token = signToken({
      id: user._id,
      role: user.role,
      email: user.email,
    });

    return NextResponse.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
