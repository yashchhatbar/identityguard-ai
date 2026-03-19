import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, BookOpen, ChevronDown } from "lucide-react";

export default function Support() {
    const navigate = useNavigate();
    const [openIndex, setOpenIndex] = useState(null);

    const faqs = [
        {
            q: "How accurate is the AI?",
            a: "We use ArcFace embeddings for highly accurate facial recognition.",
        },
        {
            q: "Is my data secure?",
            a: "Yes. Images are processed temporarily and never stored permanently.",
        },
        {
            q: "Why upload failed?",
            a: "Ensure the image has a clear visible face with good lighting.",
        },
        {
            q: "What formats are supported?",
            a: "JPEG, PNG, and WebP formats are supported.",
        },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-blue-50 px-6 py-12">

            {/* HERO */}
            <div className="max-w-5xl mx-auto text-center mb-14">
                <h1 className="text-5xl font-bold text-slate-900">
                    Support Center
                </h1>
                <p className="text-gray-600 mt-4 text-lg">
                    Get help, explore guides, and resolve issues faster.
                </p>
            </div>

            {/* MAIN CARDS */}
            <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8">

                {/* CONTACT CARD */}
                <div className="relative bg-white p-6 rounded-3xl border shadow-lg hover:shadow-xl transition group">
                    <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-100 to-purple-100 opacity-0 group-hover:opacity-30 transition" />

                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                            <Mail className="text-blue-600" />
                            <h2 className="text-xl font-semibold">Contact Support</h2>
                        </div>

                        <p className="text-gray-600 mb-4 text-sm">
                            Need help? Reach out to our support team.
                        </p>

                        <a
                            href="mailto:yashchhatbar11@gmail.com?subject=Support Request"
                            className="text-blue-600 font-medium hover:underline"
                        >
                            yashchhatbar11@gmail.com
                        </a>

                        <p className="text-xs text-gray-500 mt-1">
                            Response within 24 hours
                        </p>

                        <button
                            onClick={() => navigate("/contact")}
                            className="mt-6 w-full py-2.5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl hover:opacity-90 transition"
                        >
                            Contact Support →
                        </button>
                    </div>
                </div>

                {/* DOC CARD */}
                <div className="relative bg-white p-6 rounded-3xl border shadow-lg hover:shadow-xl transition group">
                    <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-green-100 to-blue-100 opacity-0 group-hover:opacity-30 transition" />

                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                            <BookOpen className="text-green-600" />
                            <h2 className="text-xl font-semibold">Documentation</h2>
                        </div>

                        <p className="text-gray-600 mb-6 text-sm">
                            Explore guides and learn how everything works step-by-step.
                        </p>

                        <button
                            onClick={() => navigate("/docs")}
                            className="w-full py-2.5 border border-gray-300 rounded-xl hover:bg-gray-100 transition"
                        >
                            View Documentation →
                        </button>
                    </div>
                </div>
            </div>

            {/* FAQ SECTION */}
            <div className="max-w-4xl mx-auto mt-16">

                <h2 className="text-2xl font-semibold mb-6 text-center">
                    Frequently Asked Questions
                </h2>

                <div className="space-y-4">
                    {faqs.map((faq, i) => (
                        <div
                            key={i}
                            className="bg-white border rounded-2xl p-4 shadow-sm"
                        >
                            <button
                                onClick={() =>
                                    setOpenIndex(openIndex === i ? null : i)
                                }
                                className="w-full flex justify-between items-center text-left"
                            >
                                <span className="font-medium text-slate-900">
                                    {faq.q}
                                </span>
                                <ChevronDown
                                    className={`transition ${openIndex === i ? "rotate-180" : ""
                                        }`}
                                />
                            </button>

                            {openIndex === i && (
                                <p className="mt-3 text-sm text-gray-600">
                                    {faq.a}
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* EXTRA CTA */}
            <div className="text-center mt-16">
                <button
                    onClick={() => navigate("/dashboard")}
                    className="px-6 py-3 bg-black text-white rounded-xl hover:opacity-90 transition"
                >
                    Go to Dashboard →
                </button>
            </div>
        </div>
    );
}