"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

interface BookingModalActions {
    open: () => void;
    close: () => void;
}

interface BookingModalContextValue extends BookingModalActions {
    isOpen: boolean;
}

const BookingModalStateContext = createContext<boolean | null>(null);
const BookingModalActionsContext = createContext<BookingModalActions | null>(null);

interface BookingModalProviderProps {
    children: React.ReactNode;
}

export function BookingModalProvider({ children }: BookingModalProviderProps) {
    const [isOpen, setIsOpen] = useState(false);

    const open = useCallback(() => setIsOpen(true), []);
    const close = useCallback(() => setIsOpen(false), []);
    const actions = useMemo<BookingModalActions>(() => ({ open, close }), [open, close]);

    return (
        <BookingModalActionsContext.Provider value={actions}>
            <BookingModalStateContext.Provider value={isOpen}>
                {children}
            </BookingModalStateContext.Provider>
        </BookingModalActionsContext.Provider>
    );
}

export function useBookingModalActions(): BookingModalActions {
    const ctx = useContext(BookingModalActionsContext);
    if (!ctx) throw new Error("useBookingModalActions must be used inside BookingModalProvider");
    return ctx;
}

export function useBookingModal(): BookingModalContextValue {
    const isOpen = useContext(BookingModalStateContext);
    const actions = useBookingModalActions();
    if (isOpen === null) throw new Error("useBookingModal must be used inside BookingModalProvider");
    return { isOpen, ...actions };
}

BookingModalProvider.displayName = "BookingModalProvider";
