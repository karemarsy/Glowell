import { describe, expect, it } from "vitest";
import { products } from "@/content/catalog";
import { buildOrder, orderMessage } from "./order";
import { createOrderId } from "./order-id";
import { orderRequestSchema } from "./order-schema";
import { priceCart } from "./pricing";

const valid = {
  items: [{ productId: "serum", quantity: 1 }],
  customer: { name: "Aline Uwase", phone: "078 123 4567", address: "Gasabo, Kimironko, near the market", email: "" },
  channel: "web" as const,
};

describe("orderRequestSchema", () => {
  it("normalises a valid order", () => {
    const r = orderRequestSchema.parse(valid);
    expect(r.customer.phone).toBe("0781234567");
    expect(r.customer.email).toBeUndefined();
  });
  it("reports field errors", () => {
    const r = orderRequestSchema.safeParse({ ...valid, customer: { ...valid.customer, phone: "123", name: "" } });
    expect(r.success).toBe(false);
    const paths = r.error!.issues.map((i) => i.path.at(-1));
    expect(paths).toEqual(expect.arrayContaining(["phone", "name"]));
  });
  it("rejects silly quantities", () => {
    expect(orderRequestSchema.safeParse({ ...valid, items: [{ productId: "serum", quantity: 500 }] }).success).toBe(false);
  });
});

describe("buildOrder", () => {
  it("prices from the catalog and includes payment and WhatsApp details", () => {
    const customer = orderRequestSchema.parse(valid).customer;
    const order = buildOrder("GW-TEST01", "web", customer, priceCart(valid.items));
    const serum = products.find((p) => p.id === "serum")!;
    expect(order.total).toBe(serum.price);
    expect(order.payment.ussd).toBe(`*182*1*1*0784346538*${serum.price}#`);
    expect(order.whatsappUrl).toMatch(/^https:\/\/wa\.me\/250784346538\?text=/);
    expect(orderMessage(order)).toContain("New order GW-TEST01");
    expect(orderMessage(order)).toContain("Phone: 0781234567");
  });
});

describe("createOrderId", () => {
  it("is GW- plus six unambiguous characters", () => {
    expect(createOrderId()).toMatch(/^GW-[0-9A-HJKMNP-TV-Z]{6}$/);
  });
});

describe("catalog", () => {
  it("has unique ids and slugs, whole prices", () => {
    expect(new Set(products.map((p) => p.id)).size).toBe(products.length);
    expect(new Set(products.map((p) => p.slug)).size).toBe(products.length);
    expect(products.every((p) => Number.isInteger(p.price) && p.price > 0)).toBe(true);
  });
});
