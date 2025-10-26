import dbConnect from "@/db/db";
import { ConsignmentModel } from "@/db/model/Consignment";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  await dbConnect();
  try {
    const body = await req.json();

    console.log("hist on post consignment api", body);

    const consignment = await ConsignmentModel.create(body);
    return NextResponse.json(
      { message: "✅ Consignment created", consignment },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function GET(req: Request) {
  await dbConnect();

  try {
    console.log("hist on get consignment api");
    const { searchParams } = new URL(req.url);

    // ✅ Extract filters from query params
    const status = searchParams.get("status");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const supplier = searchParams.get("supplier");
    const customer = searchParams.get("customer");
    const destination = searchParams.get("destination");

    // ✅ Build dynamic filter object
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: any = {};

    if (status) filter.status = status;
    if (supplier) filter.supplier = supplier;
    if (customer) filter.customer = customer;
    if (destination)
      filter.destination = { $regex: destination, $options: "i" };

    // Filter by date range
    if (startDate || endDate) {
      filter.startDate = {};
      if (startDate) filter.startDate.$gte = new Date(startDate);
      if (endDate) filter.startDate.$lte = new Date(endDate);
    }

    // ✅ Fetch consignments based on filters
    const consignments = await ConsignmentModel.find(filter)
      .populate({
        path: "admin supplier customer",
        select: "name email role",
      })
      .sort({ createdAt: -1 });

    return NextResponse.json({ consignments }, { status: 200 });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("❌ Error fetching consignments:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
