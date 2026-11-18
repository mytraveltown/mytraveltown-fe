import { LegalPageLayout, LegalSection } from "@/components/site/LegalPageLayout";
import { SEO } from "@/components/SEO";
import { seoText } from "@/lib/text";

const TERMS = [
  {
    title: "1. Use of Website",
    body: "MyTravelTown is a travel agency that offers insights on vacation, destination analyses, and travel-related information. This website's content is solely intended for general informational purposes. Without giving previous warning, we reserve the right to update, change, or remove any portion of our website.",
  },
  {
    title: "2. Intellectual Property",
    body: "All content on MyTravelTown, including text, photos, logos, and trademarks, is owned by the website or its licensors. Any unauthorized use, duplication, or dissemination of the content is forbidden without our express consent.",
  },
  {
    title: "3. User Responsibilities",
    body: "You promise to use our website only for legitimate objectives. You agree not to use this website in any way that would interfere with, disturb, or negatively affect other users' experiences. It is completely forbidden to engage in any abusive, defamatory, or unlawful action.",
  },
  {
    title: "4. Accuracy of Information",
    body: "MyTravelTown makes every effort to present accurate and current information; however, we cannot guarantee that the content is 100 percent correct or dependable. Packages, advice, and travel information are subject to change, and we advise users to independently confirm any travel-related data.",
  },
  {
    title: "5. External Links",
    body: "For your convenience, MyTravelTown may provide links to websites operated by third parties. We have no control over these external websites, and we accept no liability for the information or policies found there. You use outside links at your own risk.",
  },
  {
    title: "6. Travel Packages and Bookings",
    body: "Unless otherwise indicated, MyTravelTown is not actively involved in bookings or reservations, even if we could promote travel packages or services. The terms and conditions of each third-party supplier apply to any reservations made through them.",
  },
  {
    title: "7. Limitation of Liability",
    body: "MyTravelTown disclaims all liability for any damages—direct, indirect, incidental, or consequential—that may result from using this website, including errors in traveler information, package specifications, or services provided by third parties.",
  },
  {
    title: "8. Changes to Terms",
    body: "MyTravelTown retains the right to change these rules at any moment. It is your duty to check this page from time to time in order to be updated on any changes.",
  },
];

export default function TermsAndConditionsPage() {
  return (
    <>
      <SEO
        title={seoText.terms.title}
        description={seoText.terms.description}
        canonical="/terms-and-conditions"
        appendSiteName={false}
      />
      <LegalPageLayout title="MyTravelTown - Terms and Conditions">
        <LegalSection title="Introduction">
          <p>
            Greetings from <strong>MY TRAVEL TOWN PRIVATE LIMITED!</strong> You
            accept and agree to be governed by the following Terms &amp;
            Conditions by accessing or using our website. Your use of our
            services, content, and information is governed by these terms. Do not
            use our website if you disagree in any way with these terms.
          </p>
        </LegalSection>

        <LegalSection title="Our Terms & Conditions">
          <div className="space-y-8">
            {TERMS.map((item) => (
              <div key={item.title}>
                <h3 className="mb-2 text-body-lg fw-semibold text-foreground">
                  {item.title}
                </h3>
                <p>{item.body}</p>
              </div>
            ))}
          </div>
        </LegalSection>

        <LegalSection title="Contact Information">
          <p>
            For any questions or concerns regarding these Terms and Conditions,
            please contact us at:
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
            By using our website, you acknowledge that you have read, understood,
            and agreed to the above Terms and Conditions.
          </p>

          <p className="mt-3 fw-semibold text-primary">
            Happy travels with MY TRAVEL TOWN PRIVATE LIMITED!
          </p>
        </div>
      </LegalPageLayout>
    </>
  );
}