import { useState } from "react";

export default function TodoForm({ onCreate }) {
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    setSubmitting(true);
    try {
      await onCreate(content.trim());
      setContent("");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="card todo-form" onSubmit={submit}>
      <input
        className="input"
        placeholder="New todo..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        disabled={submitting}
      />
      <button className="btn btn-primary" disabled={submitting}>
        {submitting ? "Adding..." : "Add"}
      </button>
    </form>
  );
}