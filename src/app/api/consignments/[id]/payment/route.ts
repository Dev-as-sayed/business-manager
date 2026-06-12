import dbConnect from "@/db/db";
import { ConsignmentModel } from "@/db/model/Consignment";
import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  await dbConnect();

  try {
    const transaction = await req.json();

    const consignment = await ConsignmentModel.findById(id);
    if (!consignment)
      return NextResponse.json(
        { success: false, message: "Consignment not found" },
        { status: 404 }
      );

    consignment.transactions.push(transaction);
    await consignment.save();

    return NextResponse.json({
      success: true,
      message: "Transaction added",
      consignment,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Something went wrong";
    logger.error("Error adding transaction", error);
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
