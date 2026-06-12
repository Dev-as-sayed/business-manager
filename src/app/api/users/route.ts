import dbConnect from "@/db/db";
import { UserModel } from "@/db/model/user";
import { successResponse, errorResponse } from "@/lib/api-response";

export async function POST(req: Request) {
  await dbConnect();
  try {
    const body = await req.json();
    const { name, email, password, role, phone, address, avatar } = body;

    if (!name || !email || !password) {
      return errorResponse("Name, email, and password are required", 400);
    }

    if (password.length < 6) {
      return errorResponse("Password must be at least 6 characters", 400);
    }

    if (role && !["admin", "customer", "supplier"].includes(role)) {
      return errorResponse("Invalid role", 400);
    }

    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return errorResponse("Email already registered!", 400);
    }

    const user = await UserModel.create({ name, email, password, role, phone, address, avatar });

    return successResponse({ message: "User registered successfully", user }, 201);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Something went wrong";
    return errorResponse(message);
  }
}

export async function GET(req: Request) {
  await dbConnect();

  try {
    const { searchParams } = new URL(req.url);
    const role = searchParams.get("role");

    if (role && !["admin", "customer", "supplier"].includes(role)) {
      return errorResponse("Invalid role filter", 400);
    }

    const filter = role ? { role } : {};
    const users = await UserModel.find(filter).select("-password");

    return successResponse({ users });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Something went wrong";
    return errorResponse(message);
  }
}
