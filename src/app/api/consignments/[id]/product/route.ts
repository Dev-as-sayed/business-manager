import dbConnect from "@/db/db";
import { ConsignmentModel } from "@/db/model/Consignment";
import { NextResponse } from "next/server";

// ✅ Add new product
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  await dbConnect();
  try {
    const product = await req.json();

    const consignment = await ConsignmentModel.findById(params.id);
    if (!consignment)
      return NextResponse.json(
        { message: "❌ Consignment not found" },
        { status: 404 }
      );

    // ✅ Push new product and trigger recalculation on save
    consignment.products.push(product);
    await consignment.save(); // pre-save hook auto recalculates

    return NextResponse.json({
      message: "✅ Product added and totals recalculated",
      consignment,
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Error adding product:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

// ✅ Update existing product
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  await dbConnect();
  try {
    const { index, product } = await req.json(); // expects {index, product}

    const consignment = await ConsignmentModel.findById(params.id);
    if (!consignment)
      return NextResponse.json(
        { message: "❌ Consignment not found" },
        { status: 404 }
      );

    if (index < 0 || index >= consignment.products.length)
      return NextResponse.json(
        { message: "❌ Invalid product index" },
        { status: 400 }
      );

    // ✅ Merge product changes
    consignment.products[index] = {
      ...consignment.products[index].toObject(),
      ...product,
    };

    await consignment.save(); // recalculates all totals & profit automatically

    return NextResponse.json({
      message: "✅ Product updated and totals recalculated",
      consignment,
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Error updating product:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
