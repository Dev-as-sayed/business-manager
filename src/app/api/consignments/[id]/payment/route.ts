import dbConnect from "@/db/db";
import { ConsignmentModel } from "@/db/model/Consignment";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> } // 👈 Promise fixed here
) {
  const { id } = await context.params; // ✅ await params
  await dbConnect();

  try {
    const product = await req.json();

    const consignment = await ConsignmentModel.findById(id);
    if (!consignment)
      return NextResponse.json(
        { message: "Consignment not found" },
        { status: 404 }
      );

    consignment.products.push(product);
    await consignment.save();

    return NextResponse.json({ message: "Product added", consignment });
  } catch (error: any) {
    console.error("❌ Error adding product:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
