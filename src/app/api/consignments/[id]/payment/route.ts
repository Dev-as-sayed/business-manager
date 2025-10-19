import dbConnect from "@/db/db";
import { ConsignmentModel } from "@/db/model/Consignment";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  await dbConnect();
  try {
    const payment = await req.json(); // { transactionId, date, amount, method, type, note, receivedBy }

    const consignment = await ConsignmentModel.findById(params.id);
    if (!consignment)
      return NextResponse.json(
        { message: "Consignment not found" },
        { status: 404 }
      );

    consignment.transactions.push(payment);
    await consignment.save(); // triggers pre-save hook to recalc totals

    return NextResponse.json({ message: "✅ Payment recorded", consignment });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
