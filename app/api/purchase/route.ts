import { NextResponse } from "next/server";
import { listTicketTypes, purchaseTickets } from "@/lib/db";

export async function POST(req: Request) {
  const form = await req.formData();
  const eventId = Number(form.get("event_id"));

  const ticketTypes = await listTicketTypes(eventId);
  const items = ticketTypes
    .map((ticket) => ({
      ticketTypeId: ticket.id,
      quantity: Number(form.get(`qty_${ticket.id}`) ?? 0)
    }))
    .filter((item) => item.quantity > 0);

  if (!items.length) {
    return NextResponse.redirect(new URL(`/events/${eventId}?error=no-items`, req.url));
  }

  try {
    await purchaseTickets(eventId, String(form.get("buyer_name") ?? ""), String(form.get("buyer_email") ?? ""), items);
    return NextResponse.redirect(new URL(`/events/${eventId}?success=purchased`, req.url));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Purchase failed";
    return NextResponse.redirect(new URL(`/events/${eventId}?error=${encodeURIComponent(message)}`, req.url));
  }
}
