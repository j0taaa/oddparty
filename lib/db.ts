import Database from "better-sqlite3";

const db = new Database("data/oddparty.sqlite");

db.exec(`
  CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    city TEXT NOT NULL,
    region TEXT NOT NULL,
    venue TEXT NOT NULL,
    starts_at TEXT NOT NULL,
    category TEXT NOT NULL,
    organizer_name TEXT NOT NULL,
    image_url TEXT
  );

  CREATE TABLE IF NOT EXISTS ticket_types (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    price_cents INTEGER NOT NULL,
    quantity_available INTEGER NOT NULL,
    FOREIGN KEY(event_id) REFERENCES events(id)
  );

  CREATE TABLE IF NOT EXISTS ticket_purchases (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_id INTEGER NOT NULL,
    buyer_name TEXT NOT NULL,
    buyer_email TEXT NOT NULL,
    total_cents INTEGER NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY(event_id) REFERENCES events(id)
  );
`);

export type EventRow = {
  id: number;
  title: string;
  description: string;
  city: string;
  region: string;
  venue: string;
  starts_at: string;
  category: string;
  organizer_name: string;
  image_url: string | null;
};

export type TicketTypeRow = {
  id: number;
  event_id: number;
  name: string;
  price_cents: number;
  quantity_available: number;
};

export async function listEvents(filters?: { region?: string; category?: string; q?: string }) {
  const where: string[] = [];
  const params: string[] = [];

  if (filters?.region) {
    where.push("region = ?");
    params.push(filters.region);
  }

  if (filters?.category) {
    where.push("category = ?");
    params.push(filters.category);
  }

  if (filters?.q) {
    where.push("(title LIKE ? OR description LIKE ? OR city LIKE ?)");
    const q = `%${filters.q}%`;
    params.push(q, q, q);
  }

  const query = `SELECT * FROM events ${where.length ? `WHERE ${where.join(" AND ")}` : ""} ORDER BY starts_at ASC`;
  return db.prepare(query).all(...params) as EventRow[];
}

export async function getEvent(id: number) {
  return db.prepare("SELECT * FROM events WHERE id = ?").get(id) as EventRow | undefined;
}

export async function listTicketTypes(eventId: number) {
  return db.prepare("SELECT * FROM ticket_types WHERE event_id = ? ORDER BY price_cents ASC").all(eventId) as TicketTypeRow[];
}

export async function createEvent(input: Omit<EventRow, "id">, tickets: Omit<TicketTypeRow, "id" | "event_id">[]) {
  const insertEvent = db.prepare(
    "INSERT INTO events (title, description, city, region, venue, starts_at, category, organizer_name, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
  );

  const result = insertEvent.run(
    input.title,
    input.description,
    input.city,
    input.region,
    input.venue,
    input.starts_at,
    input.category,
    input.organizer_name,
    input.image_url
  );

  const eventId = Number(result.lastInsertRowid);
  const insertTicket = db.prepare("INSERT INTO ticket_types (event_id, name, price_cents, quantity_available) VALUES (?, ?, ?, ?)");

  for (const ticket of tickets) {
    insertTicket.run(eventId, ticket.name, ticket.price_cents, ticket.quantity_available);
  }

  return eventId;
}

export async function purchaseTickets(
  eventId: number,
  buyerName: string,
  buyerEmail: string,
  items: { ticketTypeId: number; quantity: number }[]
) {
  const selectTicket = db.prepare("SELECT * FROM ticket_types WHERE id = ? AND event_id = ?");
  const updateTicket = db.prepare("UPDATE ticket_types SET quantity_available = quantity_available - ? WHERE id = ?");
  const insertPurchase = db.prepare(
    "INSERT INTO ticket_purchases (event_id, buyer_name, buyer_email, total_cents, created_at) VALUES (?, ?, ?, ?, ?)"
  );

  let total = 0;

  for (const item of items) {
    const ticket = selectTicket.get(item.ticketTypeId, eventId) as TicketTypeRow | undefined;
    if (!ticket) throw new Error("Ticket type not found.");
    if (ticket.quantity_available < item.quantity) throw new Error(`Not enough availability for ${ticket.name}.`);
    total += ticket.price_cents * item.quantity;
  }

  db.transaction(() => {
    for (const item of items) {
      updateTicket.run(item.quantity, item.ticketTypeId);
    }
    insertPurchase.run(eventId, buyerName, buyerEmail, total, new Date().toISOString());
  })();

  return total;
}

export async function seedDemoData() {
  const existing = db.prepare("SELECT COUNT(*) as count FROM events").get() as { count: number };
  if (existing.count > 0) return;

  const demoEvents = [
    {
      title: "Sunset Rooftop House Party",
      description: "An open-air house and disco sunset set with local DJs, visuals and craft drinks.",
      city: "Lisbon",
      region: "Portugal",
      venue: "Miradouro Rooftop",
      starts_at: "2026-06-19T18:00:00.000Z",
      category: "Music",
      organizer_name: "OddParty Crew",
      image_url: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30"
    },
    {
      title: "Indie Film + Street Food Night",
      description: "Short film curation followed by networking and curated food trucks.",
      city: "Porto",
      region: "Portugal",
      venue: "Ribeira Creative Hub",
      starts_at: "2026-07-03T20:00:00.000Z",
      category: "Cinema",
      organizer_name: "Frame Collective",
      image_url: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba"
    },
    {
      title: "Startup & Product Meetup",
      description: "Lightning talks from founders and PMs, live Q&A and drinks.",
      city: "Madrid",
      region: "Spain",
      venue: "La Nave",
      starts_at: "2026-06-28T17:30:00.000Z",
      category: "Networking",
      organizer_name: "Build Nights",
      image_url: "https://images.unsplash.com/photo-1511578314322-379afb476865"
    }
  ] satisfies Omit<EventRow, "id">[];

  for (const event of demoEvents) {
    const eventId = await createEvent(event, [
      { name: "Early Bird", price_cents: 1800, quantity_available: 80 },
      { name: "General", price_cents: 3200, quantity_available: 150 },
      { name: "VIP", price_cents: 6000, quantity_available: 30 }
    ]);

    if (event.category === "Networking") {
      db.prepare("UPDATE ticket_types SET price_cents = 0 WHERE event_id = ? AND name = ?").run(eventId, "Early Bird");
    }
  }
}
