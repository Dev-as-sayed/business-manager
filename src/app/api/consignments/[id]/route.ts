import dbConnect from "@/db/db";
import { ConsignmentModel } from "@/db/model/Consignment";
import { successResponse, errorResponse } from "@/lib/api-response";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await dbConnect();
  try {
    const { id } = await params;
    const consignment = await ConsignmentModel.findById(id)
      .populate("supplier")
      .populate("customer");

    if (!consignment) return errorResponse("Consignment not found", 404);

    return successResponse({ consignment });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Something went wrong";
    return errorResponse(message);
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await dbConnect();
  try {
    const { id } = await params;
    const body = await req.json();

    if (body.status && !["pending", "in-transit", "delivered", "cancelled", "partially-delivered", "refunded"].includes(body.status)) {
      return errorResponse("Invalid status", 400);
    }

    const updated = await ConsignmentModel.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });

    if (!updated) return errorResponse("Consignment not found", 404);

    return successResponse({ message: "Consignment updated", consignment: updated });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Something went wrong";
    return errorResponse(message);
  }
}

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await dbConnect();
  try {
    const { id } = await params;

    const consignment = await ConsignmentModel.findById(id);
    if (!consignment) return errorResponse("Consignment not found", 404);

    await ConsignmentModel.findByIdAndDelete(id);
    return successResponse({ message: "Consignment deleted" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Something went wrong";
    return errorResponse(message);
  }
}
