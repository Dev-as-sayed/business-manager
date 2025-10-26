import dbConnect from "@/db/db";
import { NextResponse } from "next/server";
import { ConsignmentModel } from "@/db/model/Consignment";

export async function GET() {
  await dbConnect();

  try {
    // Fetch all consignments
    const consignments = await ConsignmentModel.find();

    if (!consignments.length) {
      return NextResponse.json({
        success: true,
        data: {
          totalConsignments: 0,
          totalSales: 0,
          totalShippingCost: 0,
          totalAdvance: 0,
          totalDue: 0,
          statusSummary: {},
          recentConsignments: [],
        },
      });
    }

    // Aggregate totals
    const totalConsignments = consignments.length;
    const totalSales = consignments.reduce(
      (sum, c) => sum + (c.totalAmount || 0),
      0
    );
    const totalShippingCost = consignments.reduce(
      (sum, c) => sum + (c.shippingCost || 0),
      0
    );
    const totalAdvance = consignments.reduce(
      (sum, c) => sum + (c.totalAdvance || 0),
      0
    );
    const totalDue = consignments.reduce(
      (sum, c) => sum + (c.totalDue || 0),
      0
    );

    // Count by status
    const statusSummary = consignments.reduce((acc, c) => {
      acc[c.status] = (acc[c.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Sort by latest created
    const recentConsignments = consignments
      .filter((c) => c.createdAt) // only keep consignments that have createdAt
      .sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateB - dateA;
      })
      .slice(0, 5)
      .map((c) => ({
        id: c._id,
        name: c.name,
        createdAt: c.createdAt,
        status: c.status,
      }));

    return NextResponse.json({
      success: true,
      data: {
        totalConsignments,
        totalSales,
        totalShippingCost,
        totalAdvance,
        totalDue,
        statusSummary,
        recentConsignments,
      },
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
