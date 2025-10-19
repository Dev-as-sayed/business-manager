import dbConnect from "@/db/db";
import { UserModel } from "@/db/model/user";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";

export async function POST(req: Request) {
  await dbConnect();
  try {
    const { email, password } = await req.json();
    let user = await UserModel.findOne({ email });
    if (!user)
      return NextResponse.json({ message: "User not found" }, { status: 404 });

    if (!(await bcrypt.compare(password, user.password))) {
      console.log("password dose not match");

      user = null;
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        role: user.role,
        email: user.email,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
