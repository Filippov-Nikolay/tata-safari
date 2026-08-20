"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { m, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { useMounted, useScrollLock } from "@/shared/hooks";
import { useBookingModal } from "@/shared/providers";
import { ArrowIcon } from "@/shared/ui";
import { cn } from "@/shared/lib/cn";
import { useBookingForm, type BookingFormField } from "./useBookingForm";
import styles from "./BookingModal.module.scss";

const EASE_REVEAL = [0.16, 1, 0.3, 1] as const;

function PresenceScrollLock({ children }: { children: React.ReactNode }) {
    useScrollLock(true);
    return <>{children}</>;
}

export function BookingModal() {
    const mounted = useMounted();
    const { isOpen, close } = useBookingModal();
    const t = useTranslations("booking");
    const { values, errors, touched, status, setField, touchField, submit, reset } = useBookingForm();
    const nameInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!isOpen || status === "submitting") return;
        const handler = (e: KeyboardEvent) => {
            if (e.key === "Escape") close();
        };
        document.addEventListener("keydown", handler);
        return () => document.removeEventListener("keydown", handler);
    }, [isOpen, status, close]);

    useEffect(() => {
        if (!isOpen) return;

        const rafId = requestAnimationFrame(() => {
            const input = nameInputRef.current;
            if (!input) return;

            input.focus({ preventScroll: true });
        });

        return () => cancelAnimationFrame(rafId);
    }, [isOpen]);

    if (!mounted) return null;

    const fieldError = (field: BookingFormField) => (touched[field] ? errors[field] : undefined);

    const handleBackdropClick = () => {
        if (status !== "submitting") {
            close();
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await submit();
    };

    return createPortal(
        <AnimatePresence onExitComplete={reset}>
            {isOpen && (
                <PresenceScrollLock>
            <m.div
                className={styles.overlay}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                onClick={handleBackdropClick}
            >
                <m.div
                    className={styles.modal}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="booking-title"
                    data-lenis-prevent
                    initial={{ opacity: 0, scale: 0.94, y: 24, filter: "blur(14px)" }}
                    animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, scale: 0.96, y: 12, filter: "blur(8px)" }}
                    transition={{ duration: 0.5, ease: EASE_REVEAL }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <p className={styles.watermark} aria-hidden="true">
                        SAFARI
                    </p>

                    <button
                        type="button"
                        className={styles.close}
                        onClick={close}
                        aria-label={t("close")}
                    >
                        &times;
                    </button>

                    <div className={styles.body}>
                        <AnimatePresence mode="wait" initial={false}>
                            {status === "success" ? (
                                <m.div
                                    key="success"
                                    className={styles.successPanel}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4, ease: EASE_REVEAL }}
                                >
                                    <svg className={styles.successRing} viewBox="0 0 64 64" aria-hidden="true">
                                        <m.circle
                                            className={styles.successCircle}
                                            cx="32"
                                            cy="32"
                                            r="29"
                                            initial={{ pathLength: 0 }}
                                            animate={{ pathLength: 1 }}
                                            transition={{ duration: 0.6, ease: EASE_REVEAL }}
                                        />
                                        <m.path
                                            className={styles.successCheck}
                                            d="M19 33 L28 42 L45 22"
                                            initial={{ pathLength: 0, opacity: 0 }}
                                            animate={{ pathLength: 1, opacity: 1 }}
                                            transition={{ duration: 0.45, delay: 0.4, ease: EASE_REVEAL }}
                                        />
                                    </svg>

                                    <h2 className={styles.successTitle}>{t("success.title")}</h2>
                                    <p className={styles.successMessage}>
                                        {t("success.message", { name: values.name.trim() || "-" })}
                                    </p>

                                    <button type="button" className={styles.successClose} onClick={close}>
                                        {t("close")}
                                    </button>
                                </m.div>
                            ) : (
                                <m.div
                                    key="form"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.3, ease: EASE_REVEAL }}
                                >
                                    <p className={styles.eyebrow}>{t("eyebrow")}</p>
                                    <h2 id="booking-title" className={styles.title}>
                                        {t("title")}
                                    </h2>
                                    <p className={styles.subtitle}>{t("subtitle")}</p>

                                    <form className={styles.form} onSubmit={handleSubmit} noValidate>
                                        <div className={styles.fieldRow}>
                                            <div className={styles.field}>
                                                <label htmlFor="booking-name" className={styles.label}>
                                                    {t("name.label")}
                                                </label>
                                                <input
                                                    ref={nameInputRef}
                                                    id="booking-name"
                                                    name="name"
                                                    type="text"
                                                    autoComplete="name"
                                                    placeholder={t("name.placeholder")}
                                                    value={values.name}
                                                    onChange={(e) => setField("name", e.target.value)}
                                                    onBlur={() => touchField("name")}
                                                    className={cn(styles.input, fieldError("name") && styles.inputError)}
                                                    aria-invalid={Boolean(fieldError("name"))}
                                                    aria-describedby={fieldError("name") ? "booking-name-error" : undefined}
                                                />
                                                <p
                                                    id="booking-name-error"
                                                    className={cn(styles.errorText, fieldError("name") && styles.errorTextVisible)}
                                                >
                                                    {fieldError("name") ? t(`errors.${errors.name}`) : null}
                                                </p>
                                            </div>

                                            <div className={styles.field}>
                                                <label htmlFor="booking-phone" className={styles.label}>
                                                    {t("phone.label")}
                                                </label>
                                                <input
                                                    id="booking-phone"
                                                    name="phone"
                                                    type="tel"
                                                    autoComplete="tel"
                                                    placeholder={t("phone.placeholder")}
                                                    value={values.phone}
                                                    onChange={(e) => setField("phone", e.target.value)}
                                                    onBlur={() => touchField("phone")}
                                                    className={cn(styles.input, fieldError("phone") && styles.inputError)}
                                                    aria-invalid={Boolean(fieldError("phone"))}
                                                    aria-describedby={fieldError("phone") ? "booking-phone-error" : undefined}
                                                />
                                                <p
                                                    id="booking-phone-error"
                                                    className={cn(styles.errorText, fieldError("phone") && styles.errorTextVisible)}
                                                >
                                                    {fieldError("phone") ? t(`errors.${errors.phone}`) : null}
                                                </p>
                                            </div>
                                        </div>

                                        <div className={styles.fieldRow}>
                                            <div className={styles.field}>
                                                <label htmlFor="booking-email" className={styles.label}>
                                                    {t("email.label")}
                                                </label>
                                                <input
                                                    id="booking-email"
                                                    name="email"
                                                    type="email"
                                                    autoComplete="email"
                                                    placeholder={t("email.placeholder")}
                                                    value={values.email}
                                                    onChange={(e) => setField("email", e.target.value)}
                                                    onBlur={() => touchField("email")}
                                                    className={cn(styles.input, fieldError("email") && styles.inputError)}
                                                    aria-invalid={Boolean(fieldError("email"))}
                                                    aria-describedby={fieldError("email") ? "booking-email-error" : undefined}
                                                />
                                                <p
                                                    id="booking-email-error"
                                                    className={cn(styles.errorText, fieldError("email") && styles.errorTextVisible)}
                                                >
                                                    {fieldError("email") ? t(`errors.${errors.email}`) : null}
                                                </p>
                                            </div>

                                            <div className={styles.field}>
                                                <label htmlFor="booking-city" className={styles.label}>
                                                    {t("city.label")}{" "}
                                                    <span className={styles.optional}>({t("city.optional")})</span>
                                                </label>
                                                <input
                                                    id="booking-city"
                                                    name="city"
                                                    type="text"
                                                    autoComplete="address-level2"
                                                    placeholder={t("city.placeholder")}
                                                    value={values.city}
                                                    onChange={(e) => setField("city", e.target.value)}
                                                    className={styles.input}
                                                />
                                                <p className={styles.errorText} aria-hidden="true" />
                                            </div>
                                        </div>

                                        <div className={styles.field}>
                                            <label className={styles.checkboxRow}>
                                                <input
                                                    type="checkbox"
                                                    checked={values.consent}
                                                    onChange={(e) => setField("consent", e.target.checked)}
                                                    onBlur={() => touchField("consent")}
                                                    className={styles.checkbox}
                                                />
                                                <span className={styles.checkboxLabel}>{t("consent")}</span>
                                            </label>
                                            <p className={cn(styles.errorText, fieldError("consent") && styles.errorTextVisible)}>
                                                {fieldError("consent") ? t(`errors.${errors.consent}`) : null}
                                            </p>
                                        </div>

                                        <button
                                            type="submit"
                                            className={styles.submitBtn}
                                            disabled={status === "submitting"}
                                        >
                                            <span>{status === "submitting" ? t("submitting") : t("submit")}</span>
                                            <span className={styles.submitIcon} aria-hidden="true">
                                                {status === "submitting" ? (
                                                    <span className={styles.spinner} />
                                                ) : (
                                                    <ArrowIcon className={styles.arrow} />
                                                )}
                                            </span>
                                        </button>
                                    </form>
                                </m.div>
                            )}
                        </AnimatePresence>
                    </div>
                </m.div>
            </m.div>
                </PresenceScrollLock>
            )}
        </AnimatePresence>,
        document.body,
    );
}
