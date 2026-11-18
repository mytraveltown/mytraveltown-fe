import { LegalPageLayout, LegalSection } from "@/components/site/LegalPageLayout";
import { SEO } from "@/components/SEO";
import { seoText } from "@/lib/text";

export default function PrivacyPolicyPage() {
  return (
    <>
      <SEO
        title={seoText.privacy.title}
        description={seoText.privacy.description}
        canonical="/privacy-policy"
        appendSiteName={false}
      />
      <LegalPageLayout title="MyTravelTown - Privacy Policy">
        <LegalSection title="Introduction">
          <p>
            We at <strong>MY TRAVEL TOWN PRIVATE LIMITED</strong> are dedicated to
            safeguarding your personal information and we respect your right to
            privacy. When you use our website and services, we collect, use, and
            protect your information as described in this Privacy Policy. You
            accept the policies and procedures outlined in this document by
            visiting or using our website.
          </p>
        </LegalSection>

        <LegalSection title="1. Information We Collect">
          <p>
            We may collect the following types of personal information when you
            visit or interact with our website:
          </p>

          <ul className="list-disc space-y-3 pl-5">
            <li>
              <strong>Personal Identifiable Information (PII):</strong> Your
              name, email address, phone number, and any other information you
              willingly give to us when requesting information, signing up for
              newsletters, or taking part in promotions.
            </li>

            <li>
              <strong>Non-Personal Information:</strong> Information used to
              evaluate website traffic and improve user experience, such as IP
              addresses, browser types, operating systems, and browsing habits.
            </li>

            <li>
              <strong>Cookies:</strong> We employ cookies to enhance your online
              experience and collect data about your usage habits. Although you
              can opt to disable cookies in your browser's settings, doing so
              might make some elements of our website inoperable.
            </li>
          </ul>
        </LegalSection>

        <LegalSection title="2. How We Use Your Information">
          <p>We use your personal information to:</p>

          <ul className="list-disc space-y-2 pl-5">
            <li>
              Give you the assistance, services, and travel information you've
              requested.
            </li>
            <li>
              Send you newsletters, updates, or marketing materials (if you've
              chosen to receive them).
            </li>
            <li>
              Based on user behavior and choices, enhance the content and
              functioning of our website.
            </li>
            <li>
              Make recommendations for locations or services based on your
              interests to personalize your experience.
            </li>
            <li>
              Examine usage trends and website traffic to improve our offerings.
            </li>
            <li>
              Respect the law and safeguard our website and users from nefarious
              activity.
            </li>
          </ul>
        </LegalSection>

        <LegalSection title="3. Information Sharing and Disclosure">
          <p>
            MyTravelTown does not sell or share your personal information with
            third parties, except in the following cases:
          </p>

          <ul className="list-disc space-y-3 pl-5">
            <li>
              <strong>Service Providers:</strong> If these reputable third-party
              service providers guarantee to keep your information private, we may
              share it with them in order to help us run the website, transact
              business, or offer you services.
            </li>

            <li>
              <strong>Legal Compliance:</strong> If compelled by law or in
              response to legitimate requests from public authorities, we may
              provide your personal information.
            </li>

            <li>
              <strong>Transactions involving Businesses:</strong> Your
              information might be moved as part of a merger, purchase, or asset
              sale.
            </li>
          </ul>
        </LegalSection>

        <LegalSection title="4. Data Security">
          <p>
            We are concerned about protecting the privacy of your personal data.
            MyTravelTown uses industry-standard security measures to guard against
            loss, misuse, and unauthorized access to your data. Please be aware,
            nevertheless, that there is no completely safe way to save or
            transfer electronic files over the internet.
          </p>
        </LegalSection>

        <LegalSection title="5. Your Rights">
          <p>You have the following rights concerning your personal data:</p>

          <ul className="list-disc space-y-3 pl-5">
            <li>
              <strong>Access:</strong> You are entitled to a copy of the personal
              data we currently have on file.
            </li>

            <li>
              <strong>Correction:</strong> You are entitled to have incomplete or
              erroneous personal data corrected.
            </li>

            <li>
              <strong>Deletion:</strong> In specific situations, you may ask us to
              remove your personal data.
            </li>

            <li>
              <strong>Opt-out:</strong> By clicking the unsubscribe link in every
              email, you may choose not to receive our newsletters or promotional
              communications.
            </li>
          </ul>
        </LegalSection>

        <LegalSection title="6. Third-Party Links">
          <p>
            Links to external websites may be found on our website. We advise you
            to check the privacy policies of those websites before submitting any
            personal information, as we are not liable for their privacy
            practices.
          </p>
        </LegalSection>

        <LegalSection title="7. Changes to This Policy">
          <p>
            <strong>MY TRAVEL TOWN PRIVATE LIMITED</strong> reserves the right to
            update or modify this Privacy Policy at any time. Any changes will be
            posted on this page with an updated <strong>"Last Updated"</strong>{" "}
            date. We encourage you to review this policy periodically to stay
            informed about how we are protecting your information.
          </p>
        </LegalSection>

        <LegalSection title="Contact Us">
          <p>
            If you have any questions or concerns about this Privacy Policy or the
            handling of your personal information, please contact us at:
          </p>

          <div className="mt-4 rounded-xl border border-border bg-muted/20 p-5">
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
          <p className="text-body-lg leading-8 text-foreground">
            By using our website, you consent to the terms outlined in this
            Privacy Policy.
          </p>

          <p className="mt-3 fw-semibold text-primary">
            We are committed to safeguarding your privacy while offering you the
            best travel experiences with MyTravelTown!
          </p>
        </div>
      </LegalPageLayout>
    </>
  );
}