import { NextResponse } from "next/server";
import { createEvent } from "@/lib/db";

export async function POST(req: Request) {
  const form = await req.formData();

  const ticketNames = form.getAll("ticket_name[]").map(String);
  const ticketPrices = form.getAll("ticket_price[]").map((v) => Math.round(Number(v) * 100));
  const ticketQtys = form.getAll("ticket_qty[]").map((v) => Number(v));

  const tickets = ticketNames.map((name, i) => ({
    name,
    price_cents: ticketPrices[i] ?? 0,
    quantity_available: ticketQtys[i] ?? 0
  }));

  const id = await createEvent(
    {
      title: String(form.get("title") ?? ""),
      description: String(form.get("description") ?? ""),
      city: String(form.get("city") ?? ""),
      region: String(form.get("region") ?? ""),
      venue: String(form.get("venue") ?? ""),
      starts_at: new Date(String(form.get("starts_at") ?? "")).toISOString(),
      category: String(form.get("category") ?? ""),
      organizer_name: String(form.get("organizer_name") ?? ""),
      image_url: null
    },
    tickets.filter((t) => t.name && t.quantity_available > 0)
  );

  return NextResponse.redirect(new URL(`/events/${id}`, req.url));
}
