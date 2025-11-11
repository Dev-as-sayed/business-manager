import dbConnect from "@/db/db";
import { ConsignmentModel } from "@/db/model/Consignment";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  await dbConnect();
  try {
    const transaction = await req.json();
    // Expected: { transactionId, date, amount, method, type, direction, party, note, addBy, status }

    console.log("✅ New transaction received:", transaction);

    const consignment = await ConsignmentModel.findById(params.id);
    if (!consignment)
      return NextResponse.json(
        { message: "Consignment not found" },
        { status: 404 }
      );

    // Add transaction
    consignment.transactions.push(transaction);

    // Save & trigger recalculation
    await consignment.save();

    // Optionally, return profit summary & totals
    const summary = consignment.getProfitSummary();

    return NextResponse.json({
      message: "✅ Transaction added and totals recalculated",
      consignment,
      summary,
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
