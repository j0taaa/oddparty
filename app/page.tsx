import Link from "next/link";
import { ArrowRight, Ticket, CalendarPlus, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  {
    icon: CalendarPlus,
    title: "Create your event in minutes",
    desc: "Publish small local experiences with multiple ticket tiers and capacities."
  },
  {
    icon: Ticket,
    title: "Sell many tickets at once",
    desc: "Attendees can pick several ticket types and quantities in one checkout flow."
  },
  {
    icon: QrCode,
    title: "Built for what comes next",
    desc: "Roadmap includes Stripe checkout, QR validation, and in-event food & drink sales."
  }
];

export default function HomePage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <section className="grid gap-10 lg:grid-cols-2 lg:items-center">
        <div className="space-y-6">
          <p className="inline-flex rounded-full bg-primary/10 px-4 py-1 text-sm font-medium text-primary">
            Local events marketplace
          </p>
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">Create and discover unforgettable small events.</h1>
          <p className="max-w-xl text-muted-foreground">
            OddParty helps organizers launch events quickly and lets guests discover what is happening in their region with
            smart filters and transparent ticket options.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/events">
              <Button size="lg">
                Explore events <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/events/new">
              <Button size="lg" variant="outline">
                Create an event
              </Button>
            </Link>
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>What you can do now</CardTitle>
            <CardDescription>Production-ready starter with Bun + Next.js + sqlite.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
              <li>Regional event feed with search and category filters.</li>
              <li>Per-event pages with ticket tiers and quantities.</li>
              <li>Event creation flow for organizers.</li>
              <li>Demo data seeded into sqlite for quick testing.</li>
            </ul>
          </CardContent>
        </Card>
      </section>

      <section className="mt-16 grid gap-6 md:grid-cols-3">
        {features.map((feature) => (
          <Card key={feature.title}>
            <CardHeader>
              <feature.icon className="h-6 w-6 text-primary" />
              <CardTitle className="text-lg">{feature.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{feature.desc}</p>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}
