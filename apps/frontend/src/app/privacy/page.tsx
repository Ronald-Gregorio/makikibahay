
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/index';

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto px-4 md:px-6 py-12">
      <header className="text-center mb-12">
        <h1 className="text-4xl font-bold font-headline text-primary">Privacy Policy</h1>
        <p className="mt-4 text-lg text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
      </header>
      
      <Card className="max-w-4xl mx-auto">
        <CardContent className="p-8 space-y-6 text-muted-foreground leading-relaxed">
          <section>
            <h2 className="text-2xl font-semibold font-headline text-foreground mb-3">1. Introduction</h2>
            <p>
              Welcome to Makikibahay ("we", "us", or "our"). We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our web application (the "Service"). Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold font-headline text-foreground mb-3">2. Information We Collect</h2>
            <p>We may collect information about you in a variety of ways. The information we may collect on the Service includes:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li><strong>Personal Data:</strong> Personally identifiable information, such as your name, email address, and telephone number, that you voluntarily give to us when you register with the Service or when you choose to participate in various activities related to the Service.</li>
              <li><strong>Survey Data:</strong> Information you provide when you take our onboarding survey, such as your status (student/worker), budget, and housing preferences.</li>
              <li><strong>Derivative Data:</strong> Information our servers automatically collect when you access the Service, such as your IP address, your browser type, your operating system, your access times, and the pages you have viewed directly before and after accessing the Service.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold font-headline text-foreground mb-3">3. Use of Your Information</h2>
            <p>
              Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the Service to:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Create and manage your account.</li>
              <li>Provide you with personalized property recommendations.</li>
              <li>Email you regarding your account or order.</li>
              <li>Enable user-to-user communications.</li>
              <li>Monitor and analyze usage and trends to improve your experience with the Service.</li>
              <li>Notify you of updates to the Service.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold font-headline text-foreground mb-3">4. Disclosure of Your Information</h2>
            <p>
              We may share information we have collected about you in certain situations. Your information may be disclosed as follows:
            </p>
             <ul className="list-disc list-inside mt-2 space-y-1">
                <li><strong>By Law or to Protect Rights:</strong> If we believe the release of information about you is necessary to respond to legal process, to investigate or remedy potential violations of our policies, or to protect the rights, property, and safety of others, we may share your information as permitted or required by any applicable law, rule, or regulation.</li>
                <li><strong>Third-Party Service Providers:</strong> We may share your information with third parties that perform services for us or on our behalf, including data analysis, email delivery, hosting services, and customer service.</li>
                <li><strong>With Your Consent:</strong> We may disclose your personal information for any other purpose with your consent.</li>
             </ul>
          </section>
          
           <section>
            <h2 className="text-2xl font-semibold font-headline text-foreground mb-3">5. Security of Your Information</h2>
            <p>
              We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold font-headline text-foreground mb-3">6. Contact Us</h2>
            <p>
              If you have questions or comments about this Privacy Policy, please contact us at:
              <br />
              <a href="mailto:privacy@makikibahay.com" className="text-primary hover:underline">privacy@makikibahay.com</a>
            </p>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
