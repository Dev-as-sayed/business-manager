import dbConnect from "@/db/db";
import { ConsignmentModel } from "@/db/model/Consignment";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  await dbConnect();
  try {
    const body = await req.json();

    const consignment = await ConsignmentModel.create(body);
    return NextResponse.json(
      { message: "✅ Consignment created", consignment },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function GET() {
  await dbConnect();
  try {
    const consignments = await ConsignmentModel.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    return NextResponse.json({ consignments }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
