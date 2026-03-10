import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function POST(req: Request) {
  await auth.api.signOut({ headers: req.headers });
  return NextResponse.redirect(new URL("/", req.url));
}
