import { NextRequest } from "next/server";
import { verifyToken } from "@/lib/jwt";

export function verifyAuth(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;

  const token = authHeader.split(" ")[1];
  const decoded = verifyToken(token);
  return decoded;
}
