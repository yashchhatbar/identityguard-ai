import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const steps = [
    {
        title: "Upload Face",
        desc: "Upload a clear face image to detect duplicates using AI.",
    },
    {
        title: "Verification",
        desc: "Compare facial embeddings with stored identities.",
    },
    {
        title: "AI Processing",
        desc: "DeepFace generates embeddings and calculates similarity.",
    },
    {
        title: "Results",
        desc: "Get similarity score and duplicate detection instantly.",
    },
];

export default function Documentation() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 px-6 py-10">

            {/* HEADER */}
            <div className="max-w-5xl mx-auto text-center mb-12">
                <h1 className="text-4xl font-bold text-slate-900">
                    Documentation
                </h1>
                <p className="text-gray-600 mt-3">
                    Everything you need to understand and use IdentityGuard AI effectively.
                </p>
            </div>

            {/* HOW IT WORKS */}
            <div className="max-w-5xl mx-auto">
                <h2 className="text-2xl font-semibold mb-6">How It Works</h2>

                <div className="grid md:grid-cols-2 gap-6">
                    {steps.map((step, i) => (
                        <motion.div
                            key={i}
                            whileHover={{ y: -5 }}
                            className="bg-white p-6 rounded-2xl border shadow-sm hover:shadow-md"
                        >
                            <h3 className="font-semibold text-lg mb-2">
                                {i + 1}. {step.title}
                            </h3>
                            <p className="text-gray-600 text-sm">{step.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* FEATURES */}
            <div className="max-w-5xl mx-auto mt-12 bg-white p-6 rounded-2xl border shadow-sm">
                <h2 className="text-xl font-semibold mb-4">Key Features</h2>

                <div className="grid sm:grid-cols-2 gap-4 text-sm text-gray-600">
                    <div>✔ Face Upload & Detection</div>
                    <div>✔ Duplicate Detection</div>
                    <div>✔ Face Verification</div>
                    <div>✔ AI Similarity Scoring</div>
                    <div>✔ Admin Dashboard</div>
                    <div>✔ Real-time Processing</div>
                </div>
            </div>

            {/* BEST PRACTICES */}
            <div className="max-w-5xl mx-auto mt-10 bg-white p-6 rounded-2xl border shadow-sm">
                <h2 className="text-xl font-semibold mb-4">Best Practices</h2>

                <ul className="space-y-3 text-sm text-gray-600">
                    <li>• Use clear, front-facing images</li>
                    <li>• Avoid low-resolution photos</li>
                    <li>• Ensure proper lighting</li>
                    <li>• Avoid multiple faces</li>
                    <li>• Keep camera steady</li>
                </ul>
            </div>

            {/* TECH DETAILS */}
            <div className="max-w-5xl mx-auto mt-10 bg-white p-6 rounded-2xl border shadow-sm">
                <h2 className="text-xl font-semibold mb-4">Technical Overview</h2>

                <p className="text-sm text-gray-600 leading-7">
                    IdentityGuard AI uses DeepFace with ArcFace embeddings to generate a
                    512-dimensional vector representation of a face. These embeddings are
                    compared using cosine similarity to detect duplicates and verify identity.
                </p>
            </div>

            {/* CTA */}
            <div className="text-center mt-12">
                <button
                    onClick={() => navigate("/dashboard")}
                    className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition"
                >
                    Try It Now →
                </button>
            </div>
        </div>
    );
}