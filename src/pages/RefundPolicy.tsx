import {
  LegalContact,
  LegalPageLayout,
  LegalSection,
} from "@/components/site/LegalPageLayout";
import { SEO } from "@/components/SEO";
import { seoText } from "@/lib/text";
import { ROUTES } from "@/lib/routes";

export default function RefundPolicyPage() {
  return (
    <>
      <SEO
        title={seoText.refund.title}
        description={seoText.refund.description}
        canonical={ROUTES.REFUND_POLICY}
        appendSiteName={false}
      />
      <LegalPageLayout title="MyTravelTown — Refund & Cancellation Policy">
        <LegalSection title="Introduction">
          <p>
            At <strong>MY TRAVEL TOWN PRIVATE LIMITED</strong>, our goal is to
            make every travel experience seamless, reliable and memorable. We are
            India's first AI TravelTech Marketplace, helping travellers connect
            with trusted travel experts and hand-picked travel experiences to plan
            their journeys with confidence.
          </p>

          <p>
            We strive to provide quality services, but we also recognise that
            sometimes travellers may encounter difficulties, unexpected
            situations, or be dissatisfied with the travel services received. This
            Refund & Cancellation Policy describes the conditions under which
            refunds may be considered at MyTravelTown.
          </p>
        </LegalSection>

        <LegalSection title="1. Commitment to Customer Satisfaction">
          <p>
            At MyTravelTown, we genuinely care about every traveller's experience.
            If you encounter any legitimate concern related to a service booked
            through our platform, please contact our support team as soon as
            possible.
          </p>

          <p>
            Our customer support team will investigate the issue and work with
            both the traveller and the concerned travel partner to find a fair and
            satisfactory resolution.
          </p>
        </LegalSection>

        <LegalSection title="2. Criteria for Refund">
          <p>
            A traveller may be eligible for a refund or partial refund in the
            following situations:
          </p>

          <ul className="list-disc pl-5 space-y-2">
            <li>
              The confirmed travel service is significantly different from what
              was promised.
            </li>
            <li>
              Some components of the agreed travel package remain unfulfilled.
            </li>
            <li>
              There is a substantial difference between the advertised service and
              the service actually provided.
            </li>
            <li>
              A travel partner causes a service-related issue affecting the trip.
            </li>
            <li>
              Booking cancellation or interruption of service as permitted under
              the applicable booking terms.
            </li>
          </ul>

          <p>
            Refund eligibility depends on the nature of the issue, unused
            services, supporting evidence and the booking terms agreed upon at the
            time of reservation.
          </p>
        </LegalSection>

        <LegalSection title="3. Partial Refund of Services Not Rendered">
          <p>
            If a traveller has paid for a complete travel package but receives
            only part of the promised services, MyTravelTown may arrange a refund
            for the unused or unfulfilled portion of the booking.
          </p>

          <p>
            The refund amount will be calculated based on the value of the
            services that were not delivered. Every request is reviewed
            individually to ensure a fair outcome.
          </p>
        </LegalSection>

        <LegalSection title="4. How to Request a Refund">
          <p>To request a refund, please follow these steps:</p>

          <ul className="list-disc pl-5 space-y-2">
            <li>Contact MyTravelTown Support with your booking details.</li>
            <li>Clearly explain the issue experienced during your trip.</li>
            <li>Provide any supporting documents or evidence if requested.</li>
            <li>Allow sufficient time for our investigation and review.</li>
          </ul>

          <p>
            Once the request has been reviewed and approved, the refund will be
            processed to the original payment method wherever applicable.
          </p>
        </LegalSection>

        <LegalSection title="5. Time Frame for Refunds">
          <p>
            Approved refunds are generally processed within{" "}
            <strong>7–14 working days</strong>. The actual time required may vary
            depending on your bank, payment gateway or financial institution.
          </p>

          <p>
            MyTravelTown will keep travellers informed throughout the refund
            process.
          </p>
        </LegalSection>

        <LegalSection title="6. Cases When Refunds Would Not Apply">
          <p>Refunds may not be available in situations including:</p>

          <ul className="list-disc pl-5 space-y-2">
            <li>Changes in personal travel plans or schedule.</li>
            <li>
              Failure to comply with booking instructions or travel requirements.
            </li>
            <li>Services that have already been fully utilized.</li>
            <li>
              Circumstances beyond reasonable control, including force majeure
              events.
            </li>
          </ul>

          <p>
            Nevertheless, every request is evaluated individually to ensure fair
            consideration wherever possible.
          </p>
        </LegalSection>

        <LegalSection title="7. Travel Partner Responsibility">
          <p>
            MyTravelTown is a travel marketplace that connects travellers with
            verified travel experts and service providers. While we actively
            assist in resolving disputes, certain refund decisions are governed by
            the travel partner's own booking terms and cancellation policies.
          </p>

          <p>
            Travellers are encouraged to carefully review all booking details,
            cancellation terms and service conditions before confirming a booking.
          </p>
        </LegalSection>

        <LegalSection title="8. Cancellation Clause">
          <p>
            Cancellation of bookings made through MyTravelTown is subject to the
            following conditions:
          </p>

          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong>User-Initiated Cancellation:</strong> Travellers may cancel
              their booking through their MyTravelTown dashboard or by contacting
              customer support.
            </li>

            <li>
              <strong>Cancellation Charges:</strong> Applicable cancellation fees
              depend on how close the cancellation request is to the scheduled
              departure date.
            </li>

            <li>
              <strong>Non-Refundable Bookings:</strong> Promotional offers,
              last-minute deals, festive offers and peak-season bookings may be
              non-refundable and non-changeable after confirmation.
            </li>

            <li>
              <strong>Cancellation by Travel Partner:</strong> If a travel partner
              cancels a confirmed booking due to operational reasons, travellers
              will be offered either an alternative arrangement of comparable
              value or a full refund for the affected service.
            </li>
          </ul>
        </LegalSection>

        <LegalSection title="9. Contact Us">
          <p>
            If you experience any issues, dissatisfaction or concerns regarding a
            travel service booked through MyTravelTown, please contact our support
            team. We are committed to resolving concerns fairly and helping
            travellers enjoy safe, reliable and memorable travel experiences.
          </p>
        </LegalSection>

        <div className="mt-10 overflow-hidden rounded-2xl border border-sky-100 bg-gradient-to-r from-sky-500 to-blue-600 p-6 shadow-lg">
          <div className="flex flex-col items-center justify-between gap-5 md:flex-row">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/15 text-title backdrop-blur">
                ✈️
              </div>

              <div>
                <h3 className="fw-bold text-white">
                  Ready for your next adventure?
                </h3>

                <p className="mt-2 max-w-2xl text-body-sm leading-6 text-blue-50">
                  Discover amazing destinations with trusted travel experts.
                  MyTravelTown helps you plan seamless, memorable journeys with
                  confidence.
                </p>
              </div>
            </div>

            <div className="flex shrink-0 gap-3">
              <a
                href="/search"
                className="rounded-full bg-white px-5 py-2.5 text-body-sm fw-semibold text-sky-700 transition hover:scale-105"
              >
                Explore
              </a>

              <a
                href={ROUTES.CONTACT}
                className="rounded-full border border-white/30 px-5 py-2.5 text-body-sm fw-semibold text-white transition hover:bg-white/10"
              >
                Contact
              </a>
            </div>
          </div>
        </div>
      </LegalPageLayout>
    </>
  );
}