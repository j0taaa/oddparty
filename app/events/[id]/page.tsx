export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getEvent, listTicketTypes, seedDemoData } from "@/lib/db";

function formatCurrency(cents: number) {
  return new Intl.NumberFormat("en", { style: "currency", currency: "EUR" }).format(cents / 100);
}

export default async function EventDetailPage({ params }: { params: { id: string } }) {
  await seedDemoData();
  const id = Number(params.id);
  const event = await getEvent(id);
  if (!event) notFound();

  const tickets = await listTicketTypes(id);

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="mb-8 h-64 rounded-xl bg-gradient-to-br from-primary/20 to-violet-200" />
      <div className="mb-8 flex flex-wrap gap-2">
        <Badge>{event.category}</Badge>
        <Badge variant="outline">{event.region}</Badge>
      </div>

      <h1 className="text-4xl font-bold tracking-tight">{event.title}</h1>
      <p className="mt-2 text-muted-foreground">
        {event.city} · {event.venue} · Organized by {event.organizer_name}
      </p>
      <p className="mt-4 max-w-3xl text-sm">{event.description}</p>

      <section className="mt-10 grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Ticket options</CardTitle>
            <CardDescription>Buy one or more tickets in a single order.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {tickets.map((ticket) => (
              <div key={ticket.id} className="flex items-center justify-between rounded-md border p-3">
                <div>
                  <p className="font-medium">{ticket.name}</p>
                  <p className="text-xs text-muted-foreground">{ticket.quantity_available} available</p>
                </div>
                <p className="font-semibold">{ticket.price_cents === 0 ? "Free" : formatCurrency(ticket.price_cents)}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Buy tickets</CardTitle>
            <CardDescription>Stripe checkout will be integrated in a next step.</CardDescription>
          </CardHeader>
          <CardContent>
            <form action="/api/purchase" method="post" className="space-y-3">
              <input type="hidden" name="event_id" value={String(event.id)} />
              <div>
                <Label htmlFor="buyer_name">Your name</Label>
                <Input id="buyer_name" name="buyer_name" required />
              </div>
              <div>
                <Label htmlFor="buyer_email">Your email</Label>
                <Input id="buyer_email" type="email" name="buyer_email" required />
              </div>
              {tickets.map((ticket) => (
                <div key={ticket.id}>
                  <Label htmlFor={`ticket-${ticket.id}`}>{ticket.name} quantity</Label>
                  <Input id={`ticket-${ticket.id}`} name={`qty_${ticket.id}`} type="number" min="0" max={ticket.quantity_available} defaultValue={0} />
                </div>
              ))}
              <Button type="submit" className="w-full">
                Confirm purchase
              </Button>
            </form>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
