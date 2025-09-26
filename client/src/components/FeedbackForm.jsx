// src/components/FeedbackForm.jsx
import { useState } from "react";
import { createFeedback } from "../api";


export default function FeedbackForm() {
    const [form, setForm] = useState({ name: "", email: "", message: "" });
    const [status, setStatus] = useState({ type: "idle", msg: "" });


    function onChange(e) {
        const { name, value } = e.target;
        setForm((f) => ({ ...f, [name]: value }));
    }


    function isValidEmail(email) {
        return /.+@.+\..+/.test(email);
    }


    async function onSubmit(e) {
        e.preventDefault();
        setStatus({ type: "idle", msg: "" });


// basic checks per spec
        if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
            setStatus({ type: "error", msg: "All fields are required." });
            return;
        }
        if (!isValidEmail(form.email)) {
            setStatus({ type: "error", msg: "Please enter a valid email." });
            return;
        }


        try {
            await createFeedback(form);
            setStatus({ type: "success", msg: "Thanks! Your feedback was submitted." });
            setForm({ name: "", email: "", message: "" });
        } catch (err) {
            setStatus({ type: "error", msg: err.message || "Failed to submit." });
        }
    }


    return (
        <div className="card">
            <h2>Send Feedback</h2>
            <form onSubmit={onSubmit} className="stack">
                <label>
                    <span>Name</span>
                    <input name="name" value={form.name} onChange={onChange} placeholder="Your name" />
                </label>


                <label>
                    <span>Email</span>
                    <input name="email" value={form.email} onChange={onChange} placeholder="you@example.com" />
                </label>


                <label>
                    <span>Message</span>
                    <textarea name="message" value={form.message} onChange={onChange} placeholder="Type your message..." rows={5} />
                </label>


                <button type="submit">Submit</button>
                {status.msg && (
                    <p className={status.type === "error" ? "error" : "success"}>{status.msg}</p>
                )}
            </form>
        </div>
    );
}
