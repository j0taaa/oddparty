import Database from "better-sqlite3";

const db = new Database("data/oddparty.sqlite");
db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS user (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    emailVerified INTEGER NOT NULL,
    image TEXT,
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS session (
    id TEXT PRIMARY KEY,
    expiresAt TEXT NOT NULL,
    token TEXT NOT NULL UNIQUE,
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL,
    ipAddress TEXT,
    userAgent TEXT,
    userId TEXT NOT NULL,
    FOREIGN KEY(userId) REFERENCES user(id)
  );

  CREATE TABLE IF NOT EXISTS account (
    id TEXT PRIMARY KEY,
    accountId TEXT NOT NULL,
    providerId TEXT NOT NULL,
    userId TEXT NOT NULL,
    accessToken TEXT,
    refreshToken TEXT,
    idToken TEXT,
    accessTokenExpiresAt TEXT,
    refreshTokenExpiresAt TEXT,
    scope TEXT,
    password TEXT,
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL,
    FOREIGN KEY(userId) REFERENCES user(id)
  );

  CREATE TABLE IF NOT EXISTS verification (
    id TEXT PRIMARY KEY,
    identifier TEXT NOT NULL,
    value TEXT NOT NULL,
    expiresAt TEXT NOT NULL,
    createdAt TEXT,
    updatedAt TEXT
  );

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
    image_url TEXT,
    organizer_user_id TEXT
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
    buyer_user_id TEXT,
    total_cents INTEGER NOT NULL,
    asaas_customer_id TEXT,
    asaas_payment_id TEXT,
    payment_status TEXT,
    billing_type TEXT,
    payment_url TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY(event_id) REFERENCES events(id)
  );
`);

function ensureColumn(table: string, column: string, sqlType: string) {
  const columns = db.prepare(`PRAGMA table_info(${table})`).all() as Array<{ name: string }>;
  if (!columns.some((col) => col.name === column)) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${sqlType}`);
  }
}

ensureColumn("events", "organizer_user_id", "TEXT");
ensureColumn("ticket_purchases", "buyer_user_id", "TEXT");
ensureColumn("ticket_purchases", "asaas_customer_id", "TEXT");
ensureColumn("ticket_purchases", "asaas_payment_id", "TEXT");
ensureColumn("ticket_purchases", "payment_status", "TEXT");
ensureColumn("ticket_purchases", "billing_type", "TEXT");
ensureColumn("ticket_purchases", "payment_url", "TEXT");

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
  organizer_user_id: string | null;
};

export type TicketTypeRow = {
  id: number;
  event_id: number;
  name: string;
  price_cents: number;
  quantity_available: number;
};

export type TicketPurchaseRow = {
  id: number;
  event_id: number;
  buyer_name: string;
  buyer_email: string;
  buyer_user_id: string | null;
  total_cents: number;
  asaas_customer_id: string | null;
  asaas_payment_id: string | null;
  payment_status: string | null;
  billing_type: string | null;
  payment_url: string | null;
  created_at: string;
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

export async function getPurchase(id: number) {
  return db.prepare("SELECT * FROM ticket_purchases WHERE id = ?").get(id) as TicketPurchaseRow | undefined;
}

export async function createEvent(input: Omit<EventRow, "id">, tickets: Omit<TicketTypeRow, "id" | "event_id">[]) {
  const insertEvent = db.prepare(
    "INSERT INTO events (title, description, city, region, venue, starts_at, category, organizer_name, image_url, organizer_user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
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
    input.image_url,
    input.organizer_user_id
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
  buyerUserId: string,
  items: { ticketTypeId: number; quantity: number }[],
  payment: {
    customerId: string;
    paymentId: string;
    status: string;
    billingType: string;
    invoiceUrl: string | null;
  }
) {
  const selectTicket = db.prepare("SELECT * FROM ticket_types WHERE id = ? AND event_id = ?");
  const updateTicket = db.prepare("UPDATE ticket_types SET quantity_available = quantity_available - ? WHERE id = ?");
  const insertPurchase = db.prepare(
    "INSERT INTO ticket_purchases (event_id, buyer_name, buyer_email, buyer_user_id, total_cents, asaas_customer_id, asaas_payment_id, payment_status, billing_type, payment_url, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
  );

  let total = 0;

  for (const item of items) {
    const ticket = selectTicket.get(item.ticketTypeId, eventId) as TicketTypeRow | undefined;
    if (!ticket) throw new Error("Ticket type not found.");
    if (ticket.quantity_available < item.quantity) throw new Error(`Not enough availability for ${ticket.name}.`);
    total += ticket.price_cents * item.quantity;
  }

  const purchaseId = db.transaction(() => {
    for (const item of items) {
      updateTicket.run(item.quantity, item.ticketTypeId);
    }
    const inserted = insertPurchase.run(
      eventId,
      buyerName,
      buyerEmail,
      buyerUserId,
      total,
      payment.customerId,
      payment.paymentId,
      payment.status,
      payment.billingType,
      payment.invoiceUrl,
      new Date().toISOString()
    );

    return Number(inserted.lastInsertRowid);
  })();

  return { total, purchaseId };
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
      image_url: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30",
      organizer_user_id: null
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
      image_url: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba",
      organizer_user_id: null
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
      image_url: "https://images.unsplash.com/photo-1511578314322-379afb476865",
      organizer_user_id: null
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
