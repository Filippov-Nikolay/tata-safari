import { describe, expect, it } from "vitest";
import { validate, type BookingFormValues } from "./useBookingForm";

const VALID: BookingFormValues = {
    name: "Jane Doe",
    phone: "+1 234 567 8900",
    email: "jane@example.com",
    city: "Springfield",
    consent: true,
};

describe("validate", () => {
    it("returns no errors for fully valid values", () => {
        expect(validate(VALID)).toEqual({});
    });

    it("flags a missing name", () => {
        expect(validate({ ...VALID, name: "" }).name).toBe("name");
        expect(validate({ ...VALID, name: "   " }).name).toBe("name");
    });

    it("does not require a city", () => {
        expect(validate({ ...VALID, city: "" }).city).toBeUndefined();
    });

    it("flags a missing or unchecked consent", () => {
        expect(validate({ ...VALID, consent: false }).consent).toBe("consent");
    });

    describe("phone", () => {
        it("accepts common real-world formats", () => {
            for (const phone of [
                "+1 234 567 8900",
                "(234) 567-8900",
                "234-567-8900",
                "+44 20 7946 0958",
            ]) {
                expect(validate({ ...VALID, phone }).phone).toBeUndefined();
            }
        });

        it("rejects empty or too-short input", () => {
            expect(validate({ ...VALID, phone: "" }).phone).toBe("phone");
            expect(validate({ ...VALID, phone: "12345" }).phone).toBe("phone");
        });

        it("rejects a value that doesn't start with a digit or +", () => {
            expect(validate({ ...VALID, phone: "abc-567-8900" }).phone).toBe("phone");
        });
    });

    describe("email", () => {
        it("accepts a normal address", () => {
            expect(
                validate({ ...VALID, email: "john.doe+booking@example.co.uk" }).email
            ).toBeUndefined();
        });

        it("rejects missing @ or domain", () => {
            expect(validate({ ...VALID, email: "" }).email).toBe("email");
            expect(validate({ ...VALID, email: "john@example" }).email).toBe("email");
            expect(validate({ ...VALID, email: "johnexample.com" }).email).toBe("email");
        });

        it("rejects whitespace inside the address", () => {
            expect(validate({ ...VALID, email: "john doe@example.com" }).email).toBe("email");
        });
    });
});
