import dbConnect from "@/db/db";
import { ConsignmentModel } from "@/db/model/Consignment";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  await dbConnect();

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const role = searchParams.get("role");

    let consignments = [];
    const filter: Record<string, string> = {};

    // ✅ Build role-based filter
    if (id && role) {
      if (role === "supplier") {
        filter.supplier = id;
      } else if (role === "customer") {
        filter.customer = id;
      } else if (role === "admin") {
        filter.admin = id;
      }
    }

    console.log("🔍 Query Params:", filter);

    // ✅ Fetch consignments
    consignments = await ConsignmentModel.find(filter)
      .populate({
        path: "admin supplier customer",
        select: "name email role",
      })
      .sort({ createdAt: -1 });

    console.log("✅ Found consignments:", consignments.length);

    return NextResponse.json({ success: true, consignments }, { status: 200 });
  } catch (error: any) {
    console.error("❌ Error fetching consignments:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
