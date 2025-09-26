import { useEffect, useRef } from "react";
// import "../styles/modal.css";

export default function Modal({ open, title, onClose, children }) {
    const panelRef = useRef(null);

    // Close on Esc
    useEffect(() => {
        if (!open) return;
        const onKey = (e) => { if (e.key === "Escape") onClose?.(); };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [open, onClose]);

    // Focus the panel when opened
    useEffect(() => {
        if (open) {
            document.body.classList.add("body--modal-open");
            panelRef.current?.focus();
            return () => document.body.classList.remove("body--modal-open");
        }
    }, [open]);

    if (!open) return null;

    return (
        <div
            aria-modal="true"
            role="dialog"
            className="modal-backdrop"
            onClick={onClose}
        >
            <div
                ref={panelRef}
                tabIndex={-1}
                className="modal-panel"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="modal-header">
                    <h3 className="modal-title">{title}</h3>
                    <button onClick={onClose} aria-label="Close" className="modal-close">×</button>
                </div>
                <div className="modal-content">{children}</div>
            </div>
        </div>
    );
}
