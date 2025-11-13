import dbConnect from "@/db/db";
import { UserModel } from "@/db/model/user";
import { NextResponse } from "next/server";

// ✅ GET /api/users/:id
export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await dbConnect();
  try {
    const user = await UserModel.findById(id).select("-password");
    if (!user)
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    return NextResponse.json({ user });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

// ✅ PUT /api/users/:id
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await dbConnect();
  try {
    const body = await req.json();
    const updatedUser = await UserModel.findByIdAndUpdate(id, body, {
      new: true,
    }).select("-password");
    if (!updatedUser)
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    return NextResponse.json({ message: "User updated", user: updatedUser });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

// ✅ DELETE /api/users/:id
export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await dbConnect();
  try {
    const { id } = await params;
    const deletedUser = await UserModel.findByIdAndDelete(id);
    if (!deletedUser)
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    return NextResponse.json({ message: "User deleted" });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
