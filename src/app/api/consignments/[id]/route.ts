import dbConnect from "@/db/db";
import { ConsignmentModel } from "@/db/model/Consignment";
import { NextResponse } from "next/server";

// ✅ GET single consignment by ID
export async function GET(
  _: Request,
  context: { params: Promise<{ id: string }> }
) {
  await dbConnect();
  const { id } = await context.params; // ✅ await params
  try {
    const consignment = await ConsignmentModel.findById(id)
      .populate("supplier")
      .populate("customer");

    if (!consignment)
      return NextResponse.json(
        { message: "Consignment not found" },
        { status: 404 }
      );

    return NextResponse.json({ consignment }, { status: 200 });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

// ✅ UPDATE (PUT)
export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  await dbConnect();
  const { id } = await context.params;
  try {
    const body = await req.json();
    const updated = await ConsignmentModel.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });

    if (!updated)
      return NextResponse.json(
        { message: "Consignment not found" },
        { status: 404 }
      );

    return NextResponse.json({
      message: "✅ Updated successfully",
      consignment: updated,
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

// ✅ DELETE
export async function DELETE(
  _: Request,
  context: { params: Promise<{ id: string }> }
) {
  await dbConnect();
  const { id } = await context.params;
  try {
    const deleted = await ConsignmentModel.findByIdAndDelete(id);
    if (!deleted)
      return NextResponse.json(
        { message: "Consignment not found" },
        { status: 404 }
      );
    return NextResponse.json({ message: "🗑️ Consignment deleted" });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
