import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Link from "next/link";

export const metadata = { title: "Terms of Service — nsywnails" };

export default function Terms() {
    return (
        <>
            <Nav />
            <main className="mx-auto max-w-3xl px-6 pt-16 pb-24">
                <p className="text-sm uppercase tracking-[0.15em] text-umber mb-3">Legal</p>
                <h1 className="font-display text-4xl sm:text-5xl text-inkDeep mb-4">Terms of Service</h1>
                <p className="text-sm text-ink/50 mb-14">Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>

                <section className="mb-8">
                    <h2 className="font-display text-xl text-inkDeep mb-3">Bookings & deposits</h2>
                    <p className="text-ink/80 leading-relaxed">
                        All appointments are made through this website and are subject to my{" "}
                        <Link href="/policies" className="text-umber underline hover:text-inkDeep">studio policies</Link>.
                        A deposit is required to secure your appointment once approved. Deposit terms,
                        cancellation, and no-show policies are outlined on the Policies page and are considered
                        part of these Terms.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="font-display text-xl text-inkDeep mb-3">Accuracy of information</h2>
                    <p className="text-ink/80 leading-relaxed">
                        By booking, you confirm that the information you provide (name, contact details,
                        student status, etc.) is accurate. Providing false information, including
                        misrepresenting student status, may result in cancellation of your appointment.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="font-display text-xl text-inkDeep mb-3">No guarantee of availability</h2>
                    <p className="text-ink/80 leading-relaxed">
                        Slot availability is limited and released periodically. Submitting a booking request
                        does not guarantee an appointment until it has been manually approved.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="font-display text-xl text-inkDeep mb-3">Limitation of liability</h2>
                    <p className="text-ink/80 leading-relaxed">
                        This site and its booking system are provided "as is." While reasonable care is taken
                        to keep the site functioning correctly, I am not liable for any indirect damages
                        arising from technical issues, missed notifications, or scheduling errors. If something
                        goes wrong with your booking, please reach out via Instagram so it can be resolved
                        directly.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="font-display text-xl text-inkDeep mb-3">Changes to these terms</h2>
                    <p className="text-ink/80 leading-relaxed">
                        These terms may be updated from time to time. Continued use of this site after changes
                        are posted constitutes acceptance of the updated terms.
                    </p>
                </section>

                <section>
                    <h2 className="font-display text-xl text-inkDeep mb-3">Contact</h2>
                    <p className="text-ink/80 leading-relaxed">
                        Questions? Message me on Instagram{" "}
                        <a href="https://instagram.com/nailsbynatwu" target="_blank" rel="noreferrer" className="text-umber underline hover:text-inkDeep">
                            @nailsbynatwu
                        </a>.
                    </p>
                </section>
            </main>
            <Footer />
        </>
    );
}