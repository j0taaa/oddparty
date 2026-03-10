import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function POST(req: Request) {
  const form = await req.formData();
  const email = String(form.get("email") ?? "");
  const password = String(form.get("password") ?? "");

  try {
    await auth.api.signInEmail({
      body: { email, password },
      headers: req.headers
    });
    return NextResponse.redirect(new URL("/events", req.url));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to sign in";
    return NextResponse.redirect(new URL(`/auth/sign-in?error=${encodeURIComponent(message)}`, req.url));
  }
}
