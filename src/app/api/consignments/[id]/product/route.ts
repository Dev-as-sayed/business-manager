import dbConnect from "@/db/db";
import { ConsignmentModel } from "@/db/model/Consignment";
import { successResponse, errorResponse } from "@/lib/api-response";
import { logger } from "@/lib/logger";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await dbConnect();
  try {
    const product = await req.json();
    const consignment = await ConsignmentModel.findById(id);
    if (!consignment) return errorResponse("Consignment not found", 404);

    consignment.products.push(product);
    await consignment.save();

    return successResponse({ message: "Product added", consignment });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Something went wrong";
    logger.error("Error adding product", error);
    return errorResponse(message);
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await dbConnect();
  try {
    const { index, product } = await req.json();
    const consignment = await ConsignmentModel.findById(id);
    if (!consignment) return errorResponse("Consignment not found", 404);

    if (index < 0 || index >= consignment.products.length)
      return errorResponse("Invalid product index", 400);

    consignment.products[index] = {
      ...consignment.products[index].toObject(),
      ...product,
    };

    await consignment.save();
    return successResponse({ message: "Product updated", consignment });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Something went wrong";
    logger.error("Error updating product", error);
    return errorResponse(message);
  }
}
