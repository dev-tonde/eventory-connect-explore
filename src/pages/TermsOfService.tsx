import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const TermsOfService = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center">Terms of Service</CardTitle>
          <p className="text-muted-foreground text-center">Last updated: {new Date().toLocaleDateString()}</p>
        </CardHeader>
        <CardContent className="prose prose-lg max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
            <p className="mb-4">
              By accessing and using Eventory, you accept and agree to be bound by the terms 
              and provision of this agreement. If you do not agree to abide by the above, 
              please do not use this service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
            <p className="mb-4">
              Eventory is a platform that allows users to discover, create, and manage events. 
              We provide tools for event organizers and attendees to connect and share experiences.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. User Accounts</h2>
            <p className="mb-4">
              To access certain features, you must create an account. You are responsible for:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Maintaining the confidentiality of your account information</li>
              <li>All activities that occur under your account</li>
              <li>Providing accurate and complete information</li>
              <li>Notifying us of any unauthorized use</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. User Conduct</h2>
            <p className="mb-4">You agree not to use the service to:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>Upload or transmit harmful, illegal, or offensive content</li>
              <li>Violate any applicable laws or regulations</li>
              <li>Infringe on intellectual property rights</li>
              <li>Engage in fraudulent or deceptive practices</li>
              <li>Spam or harass other users</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Event Creation and Management</h2>
            <p className="mb-4">
              Event organizers are responsible for:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Providing accurate event information</li>
              <li>Honoring ticket sales and refund policies</li>
              <li>Complying with applicable laws and venue requirements</li>
              <li>Managing attendee communications professionally</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Payment and Refunds</h2>
            <p className="mb-4">
              Payment processing is handled through secure third-party providers. 
              Refund policies are set by individual event organizers and must be 
              clearly communicated to attendees.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. Intellectual Property</h2>
            <p className="mb-4">
              All content on Eventory, including but not limited to text, graphics, logos, 
              and software, is the property of Eventory or its content suppliers and is 
              protected by copyright and other intellectual property laws.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">8. Limitation of Liability</h2>
            <p className="mb-4">
              Eventory shall not be liable for any indirect, incidental, special, 
              consequential, or punitive damages resulting from your use of the service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">9. Termination</h2>
            <p className="mb-4">
              We reserve the right to terminate or suspend your account at any time 
              for violations of these terms or for any other reason at our sole discretion.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">10. Changes to Terms</h2>
            <p className="mb-4">
              We reserve the right to modify these terms at any time. Changes will be 
              effective immediately upon posting. Your continued use of the service 
              constitutes acceptance of the modified terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">11. Contact Information</h2>
            <p className="mb-4">
              For questions about these Terms of Service, please contact us at 
              legal@eventory.com.
            </p>
          </section>
        </CardContent>
      </Card>
    </div>
  );
};

export default TermsOfService;