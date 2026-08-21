"use client";

import { useCallback, useState } from "react";

export interface BookingFormValues {
    name: string;
    phone: string;
    email: string;
    city: string;
    consent: boolean;
}

export type BookingFormField = keyof BookingFormValues;
export type BookingFormErrors = Partial<Record<BookingFormField, string>>;
export type BookingFormStatus = "idle" | "submitting" | "success";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^[+\d(][\d\s().-]{6,}$/;

const INITIAL_VALUES: BookingFormValues = {
    name: "",
    phone: "",
    email: "",
    city: "",
    consent: false,
};

export function validate(values: BookingFormValues): BookingFormErrors {
    const errors: BookingFormErrors = {};

    if (!values.name.trim()) {
        errors.name = "name";
    }

    if (!values.phone.trim() || !PHONE_PATTERN.test(values.phone.trim())) {
        errors.phone = "phone";
    }

    if (!values.email.trim() || !EMAIL_PATTERN.test(values.email.trim())) {
        errors.email = "email";
    }

    if (!values.consent) {
        errors.consent = "consent";
    }

    return errors;
}

export function useBookingForm() {
    const [values, setValues] = useState<BookingFormValues>(INITIAL_VALUES);
    const [touched, setTouched] = useState<Partial<Record<BookingFormField, boolean>>>({});
    const [status, setStatus] = useState<BookingFormStatus>("idle");

    const errors = validate(values);

    const setField = useCallback(
        <K extends BookingFormField>(field: K, value: BookingFormValues[K]) => {
            setValues((prev) => ({ ...prev, [field]: value }));
        },
        []
    );

    const touchField = useCallback(
        (field: BookingFormField) => {
            const value = values[field];
            const hasContent = typeof value === "string" ? value.trim().length > 0 : value === true;

            if (!hasContent) {
                return;
            }

            setTouched((prev) => ({ ...prev, [field]: true }));
        },
        [values]
    );

    const reset = useCallback(() => {
        setValues(INITIAL_VALUES);
        setTouched({});
        setStatus("idle");
    }, []);

    const submit = useCallback(async () => {
        setTouched({ name: true, phone: true, email: true, city: true, consent: true });

        if (Object.keys(validate(values)).length > 0) {
            return false;
        }

        setStatus("submitting");
        await new Promise((resolve) => setTimeout(resolve, 1100));
        setStatus("success");
        return true;
    }, [values]);

    return { values, errors, touched, status, setField, touchField, submit, reset };
}
