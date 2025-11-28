import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { findUserByName } from "@/lib/userService";
import { signAuthToken } from "@/utils/jwt";
const schema = z.object({
  name: z.string(),
  password: z.string(),
});

function userResponse(status: number, msg: string, token?: string, userId?: string | number) {
  const body: { msg: string; token?: string; userId?: string | number } = { msg };
  if (typeof token === "string") body.token = token;
  if (typeof userId !== "undefined") body.userId = userId;
  return NextResponse.json(body, { status });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const parsed = schema.safeParse(body);
    if (!parsed.success) return userResponse(400, "Invalid request");

    const user = await findUserByName(parsed.data.name);
    if (!user.data) return userResponse(404, "User not found");

    // const isPasswordValid = await bcrypt.compare(parsed.data.password, user.data.password);
    const isPasswordValid = parsed.data.password === user.data.password;
    if (!isPasswordValid) return userResponse(401, "Wrong password");

    const userId = user.data.id as string | number;
    const token = signAuthToken(userId, user.data.name);

    return userResponse(200, "Login success", token, userId);
  } catch (error) {
    return userResponse(500, error instanceof Error ? error.message : "Unknown error");
  }
}
