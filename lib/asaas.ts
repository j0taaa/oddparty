export type AsaasCheckoutResult = {
  customerId: string;
  paymentId: string;
  status: string;
  billingType: string;
  invoiceUrl: string | null;
};

async function asaasRequest<T>(path: string, init: RequestInit) {
  const baseUrl = process.env.ASAAS_BASE_URL ?? "https://api-sandbox.asaas.com/v3";
  const key = process.env.ASAAS_KEY;

  if (!key) {
    throw new Error("ASAAS_KEY is missing.");
  }

  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      access_token: key,
      ...(init.headers ?? {})
    },
    cache: "no-store"
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Asaas error (${response.status}): ${body}`);
  }

  return (await response.json()) as T;
}

export async function createAsaasPayment(input: {
  name: string;
  email: string;
  totalCents: number;
  eventTitle: string;
  eventId: number;
}) {
  const customer = await asaasRequest<{ id: string }>("/customers", {
    method: "POST",
    body: JSON.stringify({
      name: input.name,
      email: input.email,
      externalReference: `oddparty-user-${input.email}`
    })
  });

  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 1);
  const dueDateIso = dueDate.toISOString().slice(0, 10);

  const payment = await asaasRequest<{
    id: string;
    status: string;
    billingType: string;
    invoiceUrl?: string;
  }>("/payments", {
    method: "POST",
    body: JSON.stringify({
      customer: customer.id,
      billingType: "UNDEFINED",
      value: Number((input.totalCents / 100).toFixed(2)),
      dueDate: dueDateIso,
      description: `OddParty: ${input.eventTitle}`,
      externalReference: `oddparty-event-${input.eventId}`,
      walletId: process.env.ASAAS_WALLETID || undefined
    })
  });

  return {
    customerId: customer.id,
    paymentId: payment.id,
    status: payment.status,
    billingType: payment.billingType,
    invoiceUrl: payment.invoiceUrl ?? null
  } satisfies AsaasCheckoutResult;
}
