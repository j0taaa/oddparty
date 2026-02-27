export const dynamic = "force-dynamic";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { listEvents, seedDemoData } from "@/lib/db";

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(iso));
}

export default async function EventsPage({
  searchParams
}: {
  searchParams: { region?: string; category?: string; q?: string };
}) {
  await seedDemoData();
  const events = await listEvents(searchParams);

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Events in your region</h1>
          <p className="text-muted-foreground">Find local experiences and buy tickets in seconds.</p>
        </div>
        <Link href="/events/new">
          <Button>Create event</Button>
        </Link>
      </div>

      <form className="mb-8 grid gap-3 rounded-lg border p-4 md:grid-cols-4">
        <Input name="q" defaultValue={searchParams.q} placeholder="Search event, city..." />
        <Select name="region" defaultValue={searchParams.region ?? ""}>
          <option value="">All regions</option>
          <option value="Portugal">Portugal</option>
          <option value="Spain">Spain</option>
        </Select>
        <Select name="category" defaultValue={searchParams.category ?? ""}>
          <option value="">All categories</option>
          <option value="Music">Music</option>
          <option value="Cinema">Cinema</option>
          <option value="Networking">Networking</option>
          <option value="Food">Food</option>
        </Select>
        <Button type="submit" variant="secondary">
          Apply filters
        </Button>
      </form>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {events.map((event) => (
          <Card key={event.id} className="overflow-hidden">
            <div className="h-40 w-full bg-gradient-to-r from-primary/30 to-violet-300" />
            <CardHeader>
              <div className="mb-2 flex flex-wrap gap-2">
                <Badge>{event.category}</Badge>
                <Badge variant="outline">{event.region}</Badge>
              </div>
              <CardTitle className="text-xl">{event.title}</CardTitle>
              <CardDescription>
                {event.city} · {event.venue}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="line-clamp-2 text-sm text-muted-foreground">{event.description}</p>
              <p className="text-sm font-medium">{formatDate(event.starts_at)}</p>
              <Link href={`/events/${event.id}`}>
                <Button className="w-full">View event</Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
      {events.length === 0 ? <p className="mt-6 text-sm text-muted-foreground">No events found.</p> : null}
    </div>
  );
}
