import { PropertyGrid } from "@/components/property/PropertyGrid";
import { Reveal } from "@/components/site/Reveal";
import { SectionHeading } from "@/components/site/SectionHeading";
import type { Property } from "@/lib/types";

export function FeaturedProperties({ properties }: { properties: Property[] }) {
  return (
    <section className="bg-paper">
      <div className="shell py-24 md:py-32">
        <SectionHeading
          eyebrow="Featured properties"
          title={
            <>
              Currently on the
              <br />
              <span className="italic text-gold-deep">DENGLER desk.</span>
            </>
          }
          lead="A rotating selection from across the portfolio — villas held for appreciation, hospitality assets trading today, and land where the consent is already granted."
          link={{ href: "/properties", label: "View all properties" }}
        />

        <Reveal className="mt-16" y={16}>
          <PropertyGrid properties={properties} priorityCount={3} />
        </Reveal>
      </div>
    </section>
  );
}
