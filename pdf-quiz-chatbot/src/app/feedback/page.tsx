"use client";

import { useState } from "react";

const FeedbackPage = () => {
  const [feedback, setFeedback] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // API-Aufruf, um das Feedback zu speichern (optional)
    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ feedback }),
      });

      if (response.ok) {
        setSubmitted(true);
        setFeedback(""); // Eingabefeld leeren
      } else {
        alert("Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.");
      }
    } catch (error) {
      console.error("Feedback konnte nicht gesendet werden:", error);
    }
  };

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen p-4"
      style={{
        backgroundImage: `url('/feedback.jpg')`, // Pfad zu deinem Bild
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <h1 className="text-3xl font-bold text-white mb-4">Feedback</h1>
      {submitted ? (
        <div className="text-green-600 text-center bg-white p-4 rounded-lg shadow-lg">
          <p>Vielen Dank für Ihr Feedback! 🙌</p>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 w-full max-w-md bg-white p-6 rounded-lg shadow-lg"
        >
          <label htmlFor="feedback" className="text-lg font-semibold">
            Teilen Sie uns Ihr Feedback mit:
          </label>
          <textarea
            id="feedback"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            rows={5}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-500"
            placeholder="Ihr Feedback hier eingeben..."
            required
          />
          <button
            type="submit"
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all"
          >
            Feedback senden
          </button>
        </form>
      )}
    </div>
  );
};

export default FeedbackPage;
