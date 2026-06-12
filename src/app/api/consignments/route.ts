import dbConnect from "@/db/db";
import { ConsignmentModel } from "@/db/model/Consignment";
import { successResponse, errorResponse } from "@/lib/api-response";
import { logger } from "@/lib/logger";

const VALID_STATUSES = [
  "pending", "in-transit", "delivered", "cancelled",
  "partially-delivered", "refunded",
];

export async function POST(req: Request) {
  await dbConnect();
  try {
    const body = await req.json();

    if (!body.admin || !body.supplier || !body.customer) {
      return errorResponse("admin, supplier, and customer are required", 400);
    }

    if (!body.products?.length) {
      return errorResponse("At least one product is required", 400);
    }

    const consignment = await ConsignmentModel.create(body);
    return successResponse({ message: "Consignment created", consignment }, 201);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Something went wrong";
    logger.error("Error creating consignment", error);
    return errorResponse(message);
  }
}

export async function GET(req: Request) {
  await dbConnect();

  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const supplier = searchParams.get("supplier");
    const customer = searchParams.get("customer");
    const destination = searchParams.get("destination");

    if (status && !VALID_STATUSES.includes(status)) {
      return errorResponse("Invalid status filter", 400);
    }

    const filter: Record<string, unknown> = {};

    if (status) filter.status = status;
    if (supplier) filter.supplier = supplier;
    if (customer) filter.customer = customer;
    if (destination) filter.destination = { $regex: destination, $options: "i" };

    if (startDate || endDate) {
      filter.startDate = {};
      if (startDate) (filter.startDate as Record<string, unknown>).$gte = new Date(startDate);
      if (endDate) (filter.startDate as Record<string, unknown>).$lte = new Date(endDate);
    }

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
