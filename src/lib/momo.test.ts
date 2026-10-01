import { describe, expect, it } from "vitest";
import { momoUssd, ussdHref } from "./momo";
import { isRwandanMobile, toInternational, toLocalMobile } from "./phone";

describe("momoUssd", () => {
  it("builds a send-to-number code", () => {
    expect(momoUssd({ number: "0784346538" }, 55_250)).toBe("*182*1*1*0784346538*55250#");
  });
  it("accepts international numbers", () => {
    expect(momoUssd({ number: "+250 784 346 538" }, 1000)).toBe("*182*1*1*0784346538*1000#");
  });
  it("prefers a merchant code", () => {
    expect(momoUssd({ merchantCode: "123456", number: "0784346538" }, 1000)).toBe("*182*8*1*123456*1000#");
  });
  it("returns null without a target or amount", () => {
    expect(momoUssd({}, 1000)).toBeNull();
    expect(momoUssd({ number: "0784346538" }, 0)).toBeNull();
  });
  it("encodes # for tel: links", () => {
    expect(ussdHref("*182*1*1*0784346538*1000#")).toBe("tel:*182*1*1*0784346538*1000%23");
  });
});

describe("phone", () => {
  it.each(["0781234567", "078 123 4567", "+250781234567", "250 72 123 4567", "0791234567"])("accepts %s", (n) => {
    expect(isRwandanMobile(n)).toBe(true);
  });
  it.each(["12345", "0761234567", "07812345678", "+254712345678", ""])("rejects %s", (n) => {
    expect(isRwandanMobile(n)).toBe(false);
  });
  it("normalises", () => {
    expect(toLocalMobile("+250 781 234 567")).toBe("0781234567");
    expect(toInternational("0781234567")).toBe("250781234567");
  });
});
