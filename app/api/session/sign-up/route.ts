import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function POST(req: Request) {
  const form = await req.formData();
  const name = String(form.get("name") ?? "");
  const email = String(form.get("email") ?? "");
  const password = String(form.get("password") ?? "");

  try {
    await auth.api.signUpEmail({
      body: { name, email, password },
      headers: req.headers
    });
    return NextResponse.redirect(new URL("/events", req.url));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to sign up";
    return NextResponse.redirect(new URL(`/auth/sign-up?error=${encodeURIComponent(message)}`, req.url));
  }
}
