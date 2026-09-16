import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/site/PageHeader";
import { Reveal } from "@/components/site/Reveal";
import { photo } from "@/lib/data/images";
import { SITE } from "@/lib/site";

/**
 * Placeholder legal copy.
 *
 * These are honest stubs, not drafted policies — they say what the page is
 * for and that it needs replacing, rather than inventing terms that look
 * enforceable. Have counsel write the real text before going live.
 */
const PAGES = {
  privacy: {
    title: "Privacy",
    lead: "How DENGLER handles the information you send us.",
    sections: [
      {
        heading: "What we collect",
        body: `When you submit an enquiry we store the name, email address, telephone number and message you provide, along with the property the enquiry relates to. We do not collect anything else, and the site sets no advertising or analytics cookies.`,
      },
      {
        heading: "What we do with it",
        body: `Your details are used to answer your enquiry and, where you have asked for it, to send information about comparable assets. They are not sold, and they are not shared with a third party outside the professional advisers working on a transaction you are party to.`,
      },
      {
        heading: "How long we keep it",
        body: `Enquiries are retained while the conversation is live and for a reasonable period afterwards. You can ask us to delete your record at any time by writing to ${SITE.email}.`,
      },
      {
        heading: "This page needs replacing",
        body: `This is placeholder copy provided with the platform. Before launch, have a qualified adviser draft a privacy notice that reflects your actual processing, your lawful basis, your retention periods and the jurisdictions you operate in.`,
      },
    ],
  },
  terms: {
    title: "Terms",
    lead: "The basis on which this site is made available.",
    sections: [
      {
        heading: "Information only",
        body: `Everything published on this site is provided for information. It is not an offer, an invitation to treat, or a contract, and nothing here forms part of any agreement for the sale or purchase of a property.`,
      },
      {
        heading: "Accuracy",
        body: `Areas, consents, valuations and trading figures are compiled from sources we consider reliable but are not warranted. Any figure that matters to your decision should be verified independently before you commit to a transaction.`,
      },
      {
        heading: "This page needs replacing",
        body: `This is placeholder copy provided with the platform. Have counsel draft terms that reflect your jurisdiction, your regulatory position and your actual liability position before launch.`,
      },
    ],
  },
  disclosures: {
    title: "Disclosures",
    lead: "What the figures on this site do and do not mean.",
    sections: [
      {
        heading: "Demonstration inventory",
        body: `The properties currently published on this platform are fictional demonstration records. Titles, valuations, yields, occupancy rates, revenue and coordinates are illustrative. No real owner, developer, operator or transaction is represented.`,
      },
      {
        heading: "Projections are not forecasts",
        body: `Where a return, yield or appreciation figure is shown, it is a projection based on stated assumptions. Projections are not forecasts, are not guaranteed, and are not a reliable indicator of future performance. Property values can fall as well as rise.`,
      },
      {
        heading: "Not investment advice",
        body: `Nothing on this site is investment, tax or legal advice, and nothing here takes account of your circumstances or objectives. Take independent advice before committing capital.`,
      },
      {
        heading: "Currency and cost",
        body: `Prices are quoted in the currency shown on each listing and exclude transfer taxes, registration fees, agency fees and financing costs, all of which vary by market.`,
      },
    ],
  },
} as const;

type LegalSlug = keyof typeof PAGES;

export function generateStaticParams() {
  return Object.keys(PAGES).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = PAGES[slug as LegalSlug];
  if (!page) return { title: "Not found", robots: { index: false, follow: false } };

  return {
    title: page.title,
    description: page.lead,
    alternates: { canonical: `/legal/${slug}` },
  };
}

export default async function LegalPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = PAGES[slug as LegalSlug];
  if (!page) notFound();

  return (
    <>
      <PageHeader
        eyebrow="Legal"
        title={page.title}
        lead={page.lead}
        image={photo("detailFacade", 1600)}
      />

      <section className="shell max-w-3xl py-20 md:py-28">
        {page.sections.map((section, index) => (
          <Reveal
            key={section.heading}
            delay={index * 0.06}
            className="border-t border-hairline py-9 first:border-t-0 first:pt-0"
          >
            <h2 className="font-display text-[1.75rem] leading-tight text-ink">
              {section.heading}
            </h2>
            <p className="mt-4 text-[0.9375rem] leading-[1.85] text-graphite">
              {section.body}
            </p>
          </Reveal>
        ))}
      </section>
    </>
  );
}
