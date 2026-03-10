import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { getSession } from "@/lib/session";

export default async function NewEventPage() {
  const session = await getSession();

  if (!session?.user) {
    return (
      <div className="mx-auto max-w-xl px-6 py-12">
        <Card>
          <CardHeader>
            <CardTitle>Sign in required</CardTitle>
            <CardDescription>You need an account before publishing events.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/auth/sign-in">
              <Button>Sign in</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <Card>
        <CardHeader>
          <CardTitle>Create an event</CardTitle>
          <CardDescription>You are signed in as {session.user.email}.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action="/api/events" method="post" className="space-y-4">
            <div>
              <Label htmlFor="title">Event title</Label>
              <Input id="title" name="title" required />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Input id="description" name="description" required />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="region">Region/Country</Label>
                <Input id="region" name="region" required />
              </div>
              <div>
                <Label htmlFor="city">City</Label>
                <Input id="city" name="city" required />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <Label htmlFor="venue">Venue</Label>
                <Input id="venue" name="venue" required />
              </div>
              <div>
                <Label htmlFor="starts_at">Start date/time</Label>
                <Input id="starts_at" type="datetime-local" name="starts_at" required />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Input id="category" name="category" placeholder="Music, Food..." required />
              </div>
            </div>

            <div className="rounded-md border p-4">
              <h3 className="mb-3 font-semibold">Ticket types</h3>
              <div className="grid gap-3 md:grid-cols-3">
                <Input name="ticket_name[]" placeholder="Name (e.g. General)" required />
                <Input name="ticket_price[]" type="number" min="0" step="0.01" placeholder="Price (EUR)" required />
                <Input name="ticket_qty[]" type="number" min="1" placeholder="Quantity" required />
              </div>
            </div>

            <Button type="submit">Publish event</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
