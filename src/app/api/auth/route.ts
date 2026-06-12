import dbConnect from "@/db/db";
import { UserModel } from "@/db/model/user";
import bcrypt from "bcrypt";
import { signToken } from "@/lib/jwt";
import { successResponse, errorResponse } from "@/lib/api-response";

export async function POST(req: Request) {
  await dbConnect();

  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return errorResponse("Email and password are required", 400);
    }

    const user = await UserModel.findOne({ email });
    if (!user)
      return errorResponse("User not found", 404);

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      return errorResponse("Invalid credentials", 401);

    const token = signToken({ id: user._id, role: user.role, email: user.email });

    return successResponse({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Something went wrong";
    return errorResponse(message);
  }
}
