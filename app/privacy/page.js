import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export const metadata = { title: "Privacy Policy — nsywnails" };

export default function Privacy() {
  return (
    <>
      <Nav/>
      <main className="mx-auto max-w-3xl px-6 pt-16 pb-24">
        <p className="text-sm uppercase tracking-[0.15em] text-umber mb-3">Legal</p>
        <h1 className="font-display text-4xl sm:text-5xl text-inkDeep mb-4">Privacy Policy</h1>
        <p className="text-sm text-ink/50 mb-14">Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>

        <section className="mb-8">
          <h2 className="font-display text-xl text-inkDeep mb-3">What I collect</h2>
          <p className="text-ink/80 leading-relaxed">
            When you book an appointment or join the waitlist, I collect your name, phone number,
            email address, and Instagram handle. This information is used solely to manage your
            appointment, contact you about your booking, and send confirmations or reminders.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="font-display text-xl text-inkDeep mb-3">How it's used</h2>
          <ul className="list-disc pl-5 space-y-2 text-ink/80 leading-relaxed">
            <li>To confirm, reschedule, or cancel your appointment</li>
            <li>To send you booking confirmations and appointment reminders via email</li>
            <li>To contact you regarding your deposit or appointment details</li>
          </ul>
          <p className="mt-3 text-ink/80 leading-relaxed">
            I do not sell, rent, or share your personal information with third parties for
            marketing purposes.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="font-display text-xl text-inkDeep mb-3">Third-party services</h2>
          <p className="text-ink/80 leading-relaxed">
            This site uses third-party services to operate — including hosting (Vercel), a
            database for storing bookings (Upstash), and an email provider (Resend) for sending
            confirmations and reminders. These providers may process your information solely to
            deliver these services on my behalf, and are bound by their own privacy and security
            practices.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="font-display text-xl text-inkDeep mb-3">Data retention</h2>
          <p className="text-ink/80 leading-relaxed">
            Booking records are kept as needed to manage appointments and for basic business
            record-keeping. You can request that your information be deleted at any time by
            contacting me directly.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="font-display text-xl text-inkDeep mb-3">Your rights</h2>
          <p className="text-ink/80 leading-relaxed">
            You may request access to, correction of, or deletion of your personal information at
            any time by messaging me on Instagram{" "}
            <a href="https://instagram.com/nailsbynatwu" target="_blank" rel="noreferrer" className="text-umber underline hover:text-inkDeep">
              @nailsbynatwu
            </a>.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="font-display text-xl text-inkDeep mb-3">Cookies & local storage</h2>
          <p className="text-ink/80 leading-relaxed">
            This site may use your browser's local storage to save your in-progress booking
            information (like your name and contact info) so you don't have to re-enter it if you
            refresh the page. This data stays on your own device and is not accessible to me
            unless you complete a booking.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl text-inkDeep mb-3">Contact</h2>
          <p className="text-ink/80 leading-relaxed">
            Questions about this policy? Message me on Instagram{" "}
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