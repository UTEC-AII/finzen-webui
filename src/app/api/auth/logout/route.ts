import { NextResponse } from "next/server";
import { TOKEN_COOKIE, USER_COOKIE } from "@/lib/constants";

// Cierra sesión eliminando las cookies.
export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.set(TOKEN_COOKIE, "", { httpOnly: true, expires: new Date(0), path: "/" });
  response.cookies.set(USER_COOKIE, "", { httpOnly: false, expires: new Date(0), path: "/" });
  return response;
}
