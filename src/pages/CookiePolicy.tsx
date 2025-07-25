import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const CookiePolicy = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center">Cookie Policy</CardTitle>
          <p className="text-muted-foreground text-center">Last updated: {new Date().toLocaleDateString()}</p>
        </CardHeader>
        <CardContent className="prose prose-lg max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">What Are Cookies</h2>
            <p className="mb-4">
              Cookies are small text files stored on your device when you visit our website. 
              They help us provide you with a better experience by remembering your preferences 
              and improving our services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">How We Use Cookies</h2>
            <p className="mb-4">We use cookies for:</p>
            <ul className="list-disc pl-6 mb-4">
              <li><strong>Essential Cookies:</strong> Required for the website to function properly</li>
              <li><strong>Performance Cookies:</strong> Help us understand how visitors interact with our website</li>
              <li><strong>Functional Cookies:</strong> Remember your preferences and settings</li>
              <li><strong>Marketing Cookies:</strong> Used to deliver relevant advertisements</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Types of Cookies We Use</h2>
            
            <div className="mb-6">
              <h3 className="text-xl font-medium mb-2">Session Cookies</h3>
              <p className="mb-4">
                These cookies are temporary and are deleted when you close your browser. 
                They help maintain your session while browsing our site.
              </p>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-medium mb-2">Persistent Cookies</h3>
              <p className="mb-4">
                These cookies remain on your device for a specified period or until you delete them. 
                They help remember your preferences for future visits.
              </p>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-medium mb-2">Third-Party Cookies</h3>
              <p className="mb-4">
                We may use third-party services like Google Analytics to analyze website usage. 
                These services may set their own cookies.
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Managing Cookies</h2>
            <p className="mb-4">
              You can control cookies through your browser settings. However, disabling certain 
              cookies may affect the functionality of our website.
            </p>
            <p className="mb-4">
              Most browsers allow you to:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>View and delete cookies</li>
              <li>Block cookies from specific sites</li>
              <li>Block all cookies</li>
              <li>Get notifications when cookies are set</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Updates to This Policy</h2>
            <p className="mb-4">
              We may update this Cookie Policy from time to time. Any changes will be posted 
              on this page with an updated date.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
            <p className="mb-4">
              If you have any questions about our use of cookies, please contact us at 
              cookies@eventory.com.
            </p>
          </section>
        </CardContent>
      </Card>
    </div>
  );
};

export default CookiePolicy;