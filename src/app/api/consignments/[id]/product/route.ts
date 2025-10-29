import dbConnect from "@/db/db";
import { ConsignmentModel } from "@/db/model/Consignment";
import { NextResponse } from "next/server";

// ✅ Add product
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  await dbConnect();
  try {
    const product = await req.json();

    console.log("hit on add product ");

    const consignment = await ConsignmentModel.findById(params.id);
    console.log(consignment);

    if (!consignment)
      return NextResponse.json(
        { message: "Consignment not found" },
        { status: 404 }
      );

    consignment.products.push(product);
    await consignment.save();

    return NextResponse.json({ message: "✅ Product added", consignment });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

// ✅ Update product
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  await dbConnect();
  try {
    const { index, product } = await req.json(); // expects {index: number, product: {...}}

    const consignment = await ConsignmentModel.findById(params.id);
    if (!consignment)
      return NextResponse.json(
        { message: "Consignment not found" },
        { status: 404 }
      );

    if (index < 0 || index >= consignment.products.length)
      return NextResponse.json(
        { message: "Invalid product index" },
        { status: 400 }
      );

    consignment.products[index] = {
      ...consignment.products[index],
      ...product,
    };
    await consignment.save();

    return NextResponse.json({ message: "✅ Product updated", consignment });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
