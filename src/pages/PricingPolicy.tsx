import { LegalPageLayout, LegalSection } from "@/components/site/LegalPageLayout";

export default function PricingPolicyPage() {
  return (
    <LegalPageLayout title="MyTravelTown - Pricing Policy">
      <LegalSection title="Introduction">
        <p>
          We at <strong>MY TRAVEL TOWN PRIVATE LIMITED</strong> believe in
          transparency, clarity and fairness in all our transactions on our
          platform. India's First AI TravelTech Marketplace connecting
          travellers directly with trusted travel experts and handpicked travel
          experiences.
        </p>

        <p>
          This Pricing Policy outlines the pricing, payments, fees and tax
          structure at MyTravelTown to help you plan your journeys with total
          confidence.
        </p>
      </LegalSection>

      <LegalSection title="1. Pricing Transparency">
        <p>
          We believe in fair, upfront pricing with no sneaky or hidden
          surprises. Here's how we maintain transparency in our price offerings:
        </p>

        <ul className="list-disc space-y-3 pl-5">
          <li>
            <strong>Marketplace Rates:</strong> The prices you see on our
            platform are supplied by our trusted travel partners, including
            curated travel agents, tour operators and hospitality providers.
          </li>

          <li>
            <strong>Detailed Price Breakdown:</strong> Before confirming your
            booking, you'll see a complete breakdown of the total cost,
            including base fares, platform fees and applicable government taxes,
            all displayed clearly during checkout.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="2. Ease of Use & Service Charges of Platforms">
        <p>
          MyTravelTown charges a nominal fee for its marketplace services to
          sustain and continuously improve India's premier AI-enabled TravelTech
          ecosystem.
        </p>

        <ul className="list-disc space-y-3 pl-5">
          <li>
            <strong>Service Fees:</strong> We may charge a standard digital
            platform processing fee during checkout to cover secure payment
            gateway charges and real-time booking automation.
          </li>

          <li>
            <strong>Personalised Planning Fees:</strong> Certain customised or
            multi-destination trips planned by dedicated travel professionals
            may include an additional service fee, which will always be clearly
            communicated before booking.
          </li>

          <li>
            <strong>Non-Refundability:</strong> Platform service fees and
            convenience charges are non-refundable for user-initiated
            cancellations, in accordance with our Refund & Cancellation Policy.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="3. Taxes and Regulatory Fees">
        <p>
          All bookings made through MyTravelTown comply with the applicable tax
          laws of India.
        </p>

        <ul className="list-disc space-y-3 pl-5">
          <li>
            <strong>Goods and Services Tax (GST):</strong> Applicable GST will
            be calculated and displayed on your invoice based on the travel
            services booked, including accommodation, transportation and holiday
            packages.
          </li>

          <li>
            <strong>Tax Collected at Source (TCS):</strong> As per Government of
            India regulations, TCS at applicable slab rates will be collected
            for international holiday packages and overseas travel bookings.
            Travellers are required to provide a valid PAN card for compliance
            and tax credit purposes.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="4. Terms and Methods of Payment">
        <p>
          We provide secure and encrypted payment options to ensure a smooth and
          dependable booking experience.
        </p>

        <ul className="list-disc space-y-3 pl-5">
          <li>
            <strong>Accepted Payment Methods:</strong> Major Credit Cards,
            Debit Cards, Net Banking, Wallet Services and Unified Payments
            Interface (UPI).
          </li>

          <li>
            <strong>Instalments & Partial Payments:</strong> Selected premium or
            personalised holiday packages may offer staged payment options such
            as an initial deposit followed by the remaining balance before the
            departure date. Payment schedules will be displayed in your booking
            dashboard.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="5. Price Variations and Holiday Surcharges">
        <p>
          Travel prices depend on seasonal demand, availability and partner
          pricing policies.
        </p>

        <ul className="list-disc space-y-3 pl-5">
          <li>
            <strong>Peak Season Surcharges:</strong> Additional charges may
            apply during peak travel seasons, festivals, public holidays or long
            weekends as determined by travel partners.
          </li>

          <li>
            <strong>Itinerary Changes:</strong> If a traveller requests changes
            to a confirmed itinerary, such as travel dates, hotel upgrades or
            additional activities, the applicable price difference and amendment
            charges imposed by the travel partner will apply.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="6. Changes and Variations in Price">
        <p>
          Our AI-powered platform continuously updates travel pricing, although
          occasional technical or synchronization issues may occur.
        </p>

        <ul className="list-disc space-y-3 pl-5">
          <li>
            <strong>System Errors:</strong> MyTravelTown reserves the right to
            cancel an unconfirmed or incorrectly priced booking if pricing
            inaccuracies arise due to technical issues or travel partner data
            errors.
          </li>

          <li>
            <strong>Resolution Protocol:</strong> If pricing changes after
            payment but before booking confirmation, our support team will
            contact you with a suitable resolution, including a corrected
            booking or a full refund.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="7. Get in Touch">
        <p>
          Should you have any questions, clarifications or disputes regarding
          pricing, billing or invoices for a travel experience booked through
          our platform, please contact our support team.
        </p>

        <p>
          We are committed to fair and transparent outcomes, ensuring every
          traveller enjoys better journeys with confidence and trust.
        </p>

        <div className="mt-5 rounded-xl border border-border bg-muted/20 p-5">
          <p>
            <strong>Email:</strong>{" "}
            <a
              href="mailto:support@mytraveltown.com"
              className="fw-medium text-primary hover:underline"
            >
              support@mytraveltown.com
            </a>
          </p>
        </div>
      </LegalSection>

      <div className="mt-10 rounded-2xl border border-primary/20 bg-primary/5 p-6 text-center">
        <h3 className="fw-bold text-foreground">
          Are You Prepared for Your Next Holiday Trip?
        </h3>

        <p className="mx-auto mt-3 max-w-3xl text-muted-foreground">
          Follow <strong>MyTravelTown</strong> and experience transparent
          pricing, trusted travel experts and seamless holiday planning.
        </p>

        <p className="mt-4 fw-semibold text-primary">
          Making Better Journeys. Stronger Connections. Meaningful Travel
          Experiences.
        </p>
      </div>
    </LegalPageLayout>
  );
}