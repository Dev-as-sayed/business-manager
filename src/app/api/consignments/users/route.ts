import dbConnect from "@/db/db";
import { ConsignmentModel } from "@/db/model/Consignment";
import { successResponse, errorResponse } from "@/lib/api-response";
import { logger } from "@/lib/logger";

export async function GET(req: Request) {
  await dbConnect();

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const role = searchParams.get("role");

    if (!id || !role) {
      return errorResponse("id and role query parameters are required", 400);
    }

    if (!["supplier", "customer", "admin"].includes(role)) {
      return errorResponse("Invalid role. Must be supplier, customer, or admin", 400);
    }

    const filter: Record<string, string> = {};
    if (role === "supplier") filter.supplier = id;
    else if (role === "customer") filter.customer = id;
    else if (role === "admin") filter.admin = id;

    const consignments = await ConsignmentModel.find(filter)
      .populate({ path: "admin supplier customer", select: "name email role" })
      .sort({ createdAt: -1 });

    return successResponse({ consignments });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Something went wrong";
    logger.error("Error fetching consignments", error);
    return errorResponse(message);
  }
}
