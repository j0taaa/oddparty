import { NextResponse } from "next/server";
import { getEvent, listTicketTypes, purchaseTickets } from "@/lib/db";
import { auth } from "@/lib/auth";
import { createAsaasPayment } from "@/lib/asaas";

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user) {
    return NextResponse.redirect(new URL("/auth/sign-in?error=Please+sign+in+to+buy+tickets", req.url));
  }

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
    const event = await getEvent(eventId);
    if (!event) throw new Error("Event not found.");

    const totalCents = items.reduce((acc, item) => {
      const ticket = ticketTypes.find((t) => t.id === item.ticketTypeId);
      return acc + (ticket ? ticket.price_cents * item.quantity : 0);
    }, 0);

    const asaas = await createAsaasPayment({
      name: session.user.name,
      email: session.user.email,
      totalCents,
      eventTitle: event.title,
      eventId
    });

    const result = await purchaseTickets(eventId, session.user.name, session.user.email, session.user.id, items, asaas);
    return NextResponse.redirect(new URL(`/events/${eventId}?success=purchased&purchaseId=${result.purchaseId}`, req.url));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Purchase failed";
    return NextResponse.redirect(new URL(`/events/${eventId}?error=${encodeURIComponent(message)}`, req.url));
  }
}
