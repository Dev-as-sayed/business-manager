import dbConnect from "@/db/db";
import { NextRequest, NextResponse } from "next/server";

// ✅ Get all orders
export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    // TODO: replace with your real DB query, e.g. const orders = await Order.find({})
    const orders: unknown[] = [];

    return NextResponse.json({ success: true, data: orders });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message ?? String(error) },
      { status: 500 }
    );
  }
}
