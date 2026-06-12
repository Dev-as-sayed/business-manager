import dbConnect from "@/db/db";
import { UserModel } from "@/db/model/user";
import { successResponse, errorResponse } from "@/lib/api-response";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await dbConnect();
  try {
    const user = await UserModel.findById(id).select("-password");
    if (!user) return errorResponse("User not found", 404);
    return successResponse({ user });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Something went wrong";
    return errorResponse(message);
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await dbConnect();
  try {
    const body = await req.json();

    if (body.role && !["admin", "customer", "supplier"].includes(body.role)) {
      return errorResponse("Invalid role", 400);
    }

    const updatedUser = await UserModel.findByIdAndUpdate(id, body, {
      new: true,
    }).select("-password");

    if (!updatedUser) return errorResponse("User not found", 404);
    return successResponse({ message: "User updated", user: updatedUser });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Something went wrong";
    return errorResponse(message);
  }
}

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await dbConnect();
  try {
    const { id } = await params;

    const user = await UserModel.findById(id);
    if (!user) return errorResponse("User not found", 404);

    await UserModel.findByIdAndDelete(id);
    return successResponse({ message: "User deleted" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Something went wrong";
    return errorResponse(message);
  }
}
