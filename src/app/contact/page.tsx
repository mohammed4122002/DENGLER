import type { Metadata } from "next";

import { InquiryForm } from "@/components/property/InquiryForm";
import { PageHeader } from "@/components/site/PageHeader";
import { Reveal } from "@/components/site/Reveal";
import { photo } from "@/lib/data/images";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Speak to a DENGLER advisor about villas, hotels, land and off-market investment opportunities.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <>
      <PageHeader
        eyebrow="Contact"
        title={
          <>
            Tell us what you
            <br />
            <span className="italic text-gold-soft">are looking for.</span>
          </>
        }
        lead="Market, ticket size, hold period. We will come back with what is available — including what never reaches a public listing."
        image={photo("interiorTerrace", 2000)}
      />

      <section className="shell grid gap-14 py-20 lg:grid-cols-12 lg:gap-16 md:py-28">
        <Reveal className="lg:col-span-5">
          <h2 className="font-display text-[1.75rem] text-ink">
            Direct lines
          </h2>
          <dl className="mt-8 divide-y divide-hairline">
            <ContactRow label="Email">
              <a href={`mailto:${SITE.email}`} className="nav-link hover:text-gold">
                {SITE.email}
              </a>
            </ContactRow>
            <ContactRow label="Telephone">
              <a
                href={`tel:${SITE.phone.replace(/\s/g, "")}`}
                className="nav-link hover:text-gold"
              >
                {SITE.phone}
              </a>
            </ContactRow>
            <ContactRow label="Offices">{SITE.address}</ContactRow>
            <ContactRow label="Hours">
              Sunday–Thursday, 09:00–18:00 GST
            </ContactRow>
          </dl>

          <p className="mt-10 max-w-sm text-sm leading-relaxed text-muted">
            For off-market enquiries, please include the market and the ticket
            range in your message — it lets us come back with something specific
            rather than a brochure.
          </p>
        </Reveal>

        <Reveal delay={0.1} className="lg:col-span-7">
          <div className="border border-hairline p-7 md:p-10">
            <h2 className="font-display text-[1.75rem] text-ink">
              Send an enquiry
            </h2>
            <div className="mt-8">
              <InquiryForm submitLabel="Send enquiry" />
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}

function ContactRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-baseline justify-between gap-6 py-4 first:pt-0">
      <dt className="eyebrow">{label}</dt>
      <dd className="text-end text-sm text-graphite">{children}</dd>
    </div>
  );
}
