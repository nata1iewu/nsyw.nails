import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

const FAQS = [
    {
        q: "When are booking slots released?",
        a: "Typically at the end of every month, but for specific dates and times please check my Instagram where updates will be posted.",
    },
    {
        q: "Can I book in advance?",
        a: "To make it fair for everyone, I do not allow people to book slots in advance.",
    },
    {
        q: "Does the student discounted rate apply only for UCSD students?",
        a: "No, any valid students qualify for student rate! Make sure to bring your student ID or some proof of enrollment :)",
    },
    {
        q: "Do you do builder gel?",
        a: "Yes, but soft gel only, not currently offering hard gel!",
    },
];

export const metadata = { title: "FAQ — nsywnails" };

export default function FAQ() {
    return (
        <>
            <Nav />
            <main className="mx-auto max-w-3xl px-6 pt-16 pb-24">
                <p className="text-sm uppercase tracking-[0.15em] text-umber mb-3">Questions</p>
                <h1 className="font-display text-4xl sm:text-5xl text-inkDeep mb-10">
                    Frequently Asked <span className="font-script text-5xl sm:text-6xl text-umber">Questions</span>
                </h1>

                <div className="divide-y divide-line/70 rounded-2xl ring-1 ring-line/70 overflow-hidden bg-mist/60">
                    {FAQS.map((item, i) => (
                        <div key={i} className="px-6 py-6">
                            <p className="font-display text-lg text-inkDeep mb-2">{item.q}</p>
                            <p className="text-base text-ink/70">{item.a}</p>
                        </div>
                    ))}
                </div>
            </main>
            <Footer />
        </>
    );
}