import { useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";

const sections = [
    { id: "intro", title: "Introduction" },
    { id: "info", title: "Information Collected" },
    { id: "biometric", title: "Biometric Data" },
    { id: "storage", title: "Data Storage" },
    { id: "security", title: "Security" },
    { id: "sharing", title: "Data Sharing" },
    { id: "rights", title: "User Rights" },
    { id: "contact", title: "Contact" },
];

export default function PrivacyPolicy() {
    const [active, setActive] = useState("intro");

    // 🔥 Scroll tracking
    useEffect(() => {
        const handleScroll = () => {
            sections.forEach((sec) => {
                const el = document.getElementById(sec.id);
                if (el) {
                    const top = el.getBoundingClientRect().top;
                    if (top <= 120) {
                        setActive(sec.id);
                    }
                }
            });
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // 🔥 Scroll to section
    const scrollTo = (id) => {
        document.getElementById(id)?.scrollIntoView({
            behavior: "smooth",
            block: "start",
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 px-6 py-10">

            {/* HEADER */}
            <div className="max-w-6xl mx-auto mb-10">
                <div className="flex items-center gap-3 text-blue-600">
                    <ShieldCheck />
                    <h1 className="text-3xl font-bold">Privacy Policy</h1>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                    Last updated: {new Date().toLocaleDateString()}
                </p>
            </div>

            <div className="max-w-6xl mx-auto grid md:grid-cols-[260px_1fr] gap-8">

                {/* SIDEBAR */}
                <div className="hidden md:block sticky top-24 h-fit">
                    <div className="bg-white/80 backdrop-blur p-4 rounded-2xl border shadow-sm">
                        <p className="font-semibold text-sm mb-3 text-slate-700">
                            On this page
                        </p>

                        <ul className="space-y-2">
                            {sections.map((s) => (
                                <li
                                    key={s.id}
                                    onClick={() => scrollTo(s.id)}
                                    className={`cursor-pointer px-3 py-2 rounded-lg text-sm transition ${active === s.id
                                            ? "bg-blue-50 text-blue-600 font-medium"
                                            : "text-gray-600 hover:bg-gray-100"
                                        }`}
                                >
                                    {s.title}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* CONTENT */}
                <div className="space-y-8">

                    {sections.map((section, i) => (
                        <div
                            key={section.id}
                            id={section.id}
                            className="bg-white p-6 rounded-2xl border shadow-sm scroll-mt-24"
                        >
                            <h2 className="text-xl font-semibold text-slate-900 mb-3">
                                {i + 1}. {section.title}
                            </h2>

                            <p className="text-gray-600 leading-7">
                                This section explains {section.title.toLowerCase()} in the context of IdentityGuard AI.
                                Our system ensures secure handling, processing, and protection of all user data.
                            </p>
                        </div>
                    ))}

                </div>
            </div>
        </div>
    );
}