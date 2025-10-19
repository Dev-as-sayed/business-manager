import dbConnect from "@/db/db";
import { ConsignmentModel } from "@/db/model/Consignment";
import { NextResponse } from "next/server";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  await dbConnect();
  try {
    const consignment = await ConsignmentModel.findById(params.id).populate(
      "users"
    );
    if (!consignment)
      return NextResponse.json(
        { message: "Consignment not found" },
        { status: 404 }
      );

    return NextResponse.json({ consignment });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  await dbConnect();
  try {
    const body = await req.json();
    const updated = await ConsignmentModel.findByIdAndUpdate(params.id, body, {
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
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function DELETE(
  _: Request,
  { params }: { params: { id: string } }
) {
  await dbConnect();
  try {
    const deleted = await ConsignmentModel.findByIdAndDelete(params.id);
    if (!deleted)
      return NextResponse.json(
        { message: "Consignment not found" },
        { status: 404 }
      );

    return NextResponse.json({ message: "🗑️ Consignment deleted" });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
