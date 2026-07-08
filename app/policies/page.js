import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Botanical from "@/components/Botanical";

export const metadata = { title: "Policies & Info — nsywnails" };

export default function Policies() {
  return (
    <>
      <Nav />
      <main className="relative mx-auto max-w-3xl px-6 pt-16 pb-24 overflow-hidden">
        <Botanical className="pointer-events-none absolute -top-6 -left-16 h-56 w-56 text-ink/15 hidden sm:block" />

        <p className="text-sm uppercase tracking-[0.15em] text-umber mb-3">Before you book</p>
        <h1 className="font-display text-4xl sm:text-5xl text-inkDeep mb-14">
          Policies <span className="font-script text-5xl sm:text-6xl text-umber">and Info</span>
        </h1>

        <section className="mb-10">
          <h2 className="font-display text-xl text-inkDeep mb-3"><span className="font-medium text-inkDeep">▶ Most important</span></h2>
          <p className="text-ink/90 leading-relaxed">
            Be respectful to me and the space I am working in. I work from my dorm, which is
            shared with other people, and the last thing I want to do is inconvenience my
            suitemates in any way.
          </p>
          <p className="mt-3 text-base text-ink/80 pl-4 border-l border-line">
            I also wish I could do everyone's nails, but academics will always be my #1
            priority.
          </p>
        </section>

        <section className="mb-10">
          <p className="text-ink/90 leading-relaxed">
            I <span className="font-medium text-inkDeep">no longer do foreign soak-offs or
              removals.</span> So please try to have your previous set removed before coming (unless I did
            your previous set).
          </p>
        </section>

        <section className="mb-10">
          <h2 className="font-display text-xl text-inkDeep mb-3"><span className="font-medium text-inkDeep">▶ Show up on time</span></h2>
          <p className="text-ink/90 leading-relaxed">
            I don't mind if you show up 5–10 minutes early but keep in mind I might not be
            ready for you until your scheduled time.
          </p>
        </section>

        <section className="mb-10">
          <p className="text-ink/90 leading-relaxed">
            I don't mind if you bring a guest along to your appointment {" "}
            <span className="font-medium text-inkDeep">but you need to let me know in advance</span>.
          </p>
        </section>

        <section className="mb-4 rounded-2xl bg-stoneDeep/60 ring-1 ring-line/70 p-8">
          <h2 className="font-display text-xl text-inkDeep mb-3">Cancellations / no-shows</h2>
          <p className="text-ink/80 leading-relaxed mb-3">
            If you need to <span className="font-medium text-inkDeep">cancel</span> your
            appointment, please let me know at least{" "}
            <span className="font-medium text-inkDeep">24 hours before</span> your appointment
            to get your deposit back.
          </p>
          <p className="text-ink/80 leading-relaxed">
            <span className="font-medium text-inkDeep">No-shows</span> or a failure to
            communicate will result in you losing your deposit — and a new deposit will be
            required if you want to rebook. Please note that I've been consistently booked out, so if you
            cancel or don't show up, it will{" "}
            <span className="font-medium text-inkDeep">not be guaranteed</span> that you get
            another appointment.
          </p>
        </section>
      </main>
      <Footer />
    </>
  );
}
