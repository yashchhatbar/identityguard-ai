import { useEffect, useState } from "react";
import { Shield } from "lucide-react";

const sections = [
    { id: "intro", title: "Introduction" },
    { id: "usage", title: "Platform Usage" },
    { id: "responsibility", title: "User Responsibilities" },
    { id: "data", title: "Data Usage" },
    { id: "security", title: "Security" },
    { id: "liability", title: "Liability" },
    { id: "updates", title: "Updates" },
    { id: "contact", title: "Contact" },
];

export default function TermsOfService() {
    const [active, setActive] = useState("intro");

    useEffect(() => {
        const handleScroll = () => {
            sections.forEach((sec) => {
                const el = document.getElementById(sec.id);
                if (el && el.getBoundingClientRect().top <= 120) {
                    setActive(sec.id);
                }
            });
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const scrollTo = (id) => {
        document.getElementById(id)?.scrollIntoView({
            behavior: "smooth",
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 px-6 py-10">

            <div className="max-w-6xl mx-auto mb-10">
                <div className="flex items-center gap-3 text-blue-600">
                    <Shield />
                    <h1 className="text-3xl font-bold">Terms of Service</h1>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                    Last updated: {new Date().toLocaleDateString()}
                </p>
            </div>

            <div className="max-w-6xl mx-auto grid md:grid-cols-[260px_1fr] gap-8">

                {/* SIDEBAR */}
                <div className="hidden md:block sticky top-24 h-fit">
                    <div className="bg-white/80 backdrop-blur p-4 rounded-2xl border shadow-sm">
                        <p className="font-semibold text-sm mb-3">On this page</p>

                        {sections.map((s) => (
                            <div
                                key={s.id}
                                onClick={() => scrollTo(s.id)}
                                className={`cursor-pointer px-3 py-2 rounded-lg text-sm transition ${active === s.id
                                    ? "bg-blue-50 text-blue-600"
                                    : "hover:bg-gray-100 text-gray-600"
                                    }`}
                            >
                                {s.title}
                            </div>
                        ))}
                    </div>
                </div>

                {/* CONTENT */}
                <div className="space-y-8">
                    {sections.map((s, i) => (
                        <div
                            key={s.id}
                            id={s.id}
                            className="bg-white p-6 rounded-2xl border shadow-sm scroll-mt-24"
                        >
                            <h2 className="text-xl font-semibold mb-2">
                                {i + 1}. {s.title}
                            </h2>
                            <p className="text-gray-600 leading-7">
                                This section explains {s.title.toLowerCase()} for IdentityGuard AI,
                                ensuring clarity, compliance, and secure platform usage.
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}