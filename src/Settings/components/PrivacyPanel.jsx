import React from "react";

export default function PrivacyPanel() {
  return (
    <div className="rounded-lg bg-white p-6 shadow-sm">
      {/* Header */}
      <div className="mb-6 border-b pb-4">
        <h2 className="text-2xl font-bold text-gray-800">Privacy Policy</h2>
        <p className="mt-2 text-sm text-gray-600">
          Last Updated: November 18, 2025
        </p>
      </div>

      {/* Content */}
      <div className="prose prose-sm max-w-none space-y-6 text-gray-700">
        
        {/* Introduction */}
        <section>
          <h3 className="text-lg font-semibold text-gray-800">1. Introduction</h3>
          <p className="mt-2 leading-relaxed">
            Welcome to SIB - Sengunthar in Business ("we," "our," or "us"). We are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application and web platform (collectively, the "Platform").
          </p>
          <p className="mt-2 leading-relaxed">
            By using the SIB Platform, you agree to the collection and use of information in accordance with this Privacy Policy. If you do not agree with our policies and practices, please do not use our Platform.
          </p>
        </section>

        {/* Information We Collect */}
        <section>
          <h3 className="text-lg font-semibold text-gray-800">2. Information We Collect</h3>
          
          <h4 className="mt-4 font-semibold text-gray-800">2.1 Personal Information</h4>
          <p className="mt-2 leading-relaxed">
            We collect information that you provide directly to us when you:
          </p>
          <ul className="mt-2 ml-6 list-disc space-y-1">
            <li>Register for an account (name, email address, phone number)</li>
            <li>Complete your member profile (company name, business category, industry type)</li>
            <li>Submit referrals, TYFTB (Thank You for the Business), or business information</li>
            <li>Upload profile photos or business documents</li>
            <li>Communicate with other members or administrators</li>
            <li>Participate in chapter meetings and events</li>
            <li>Contact customer support</li>
          </ul>

          <h4 className="mt-4 font-semibold text-gray-800">2.2 Business Information</h4>
          <p className="mt-2 leading-relaxed">
            As a business networking platform, we collect business-related information including:
          </p>
          <ul className="mt-2 ml-6 list-disc space-y-1">
            <li>Company name and business details</li>
            <li>Referral information and business transactions</li>
            <li>Meeting attendance records</li>
            <li>Business performance metrics</li>
            <li>Visitor information and conversion data</li>
            <li>Member-to-member meeting records</li>
          </ul>

          <h4 className="mt-4 font-semibold text-gray-800">2.3 Automatically Collected Information</h4>
          <p className="mt-2 leading-relaxed">
            When you access our Platform, we automatically collect:
          </p>
          <ul className="mt-2 ml-6 list-disc space-y-1">
            <li>Device information (device type, operating system, unique device identifiers)</li>
            <li>Log information (IP address, browser type, access times)</li>
            <li>Usage data (features used, pages visited, interactions with the Platform)</li>
            <li>Location information (with your permission)</li>
            <li>Cookies and similar tracking technologies</li>
          </ul>
        </section>

        {/* How We Use Your Information */}
        <section>
          <h3 className="text-lg font-semibold text-gray-800">3. How We Use Your Information</h3>
          <p className="mt-2 leading-relaxed">
            We use the collected information for the following purposes:
          </p>
          <ul className="mt-2 ml-6 list-disc space-y-1">
            <li>To provide, maintain, and improve our Platform services</li>
            <li>To facilitate business networking and referral exchanges</li>
            <li>To process and manage chapter memberships</li>
            <li>To track attendance, referrals, and business performance</li>
            <li>To communicate with you about meetings, events, and platform updates</li>
            <li>To enable member-to-member connections and business opportunities</li>
            <li>To generate reports and analytics for chapter performance</li>
            <li>To provide customer support and respond to inquiries</li>
            <li>To detect, prevent, and address technical issues or fraudulent activities</li>
            <li>To comply with legal obligations and enforce our terms of service</li>
          </ul>
        </section>

        {/* Information Sharing */}
        <section>
          <h3 className="text-lg font-semibold text-gray-800">4. Information Sharing and Disclosure</h3>
          
          <h4 className="mt-4 font-semibold text-gray-800">4.1 Within the SIB Network</h4>
          <p className="mt-2 leading-relaxed">
            Your profile information, business details, and networking activity may be visible to:
          </p>
          <ul className="mt-2 ml-6 list-disc space-y-1">
            <li>Other members within your chapter</li>
            <li>Chapter administrators and coordinators</li>
            <li>Regional administrators overseeing your chapter</li>
            <li>Members of other chapters (for cross-chapter networking, with your consent)</li>
          </ul>

          <h4 className="mt-4 font-semibold text-gray-800">4.2 Third-Party Service Providers</h4>
          <p className="mt-2 leading-relaxed">
            We may share information with trusted third-party service providers who assist us in:
          </p>
          <ul className="mt-2 ml-6 list-disc space-y-1">
            <li>Cloud hosting and data storage</li>
            <li>Email and communication services</li>
            <li>Payment processing (if applicable)</li>
            <li>Analytics and performance monitoring</li>
            <li>Customer support tools</li>
          </ul>
          <p className="mt-2 leading-relaxed">
            These service providers are contractually obligated to protect your information and use it only for the purposes we specify.
          </p>

          <h4 className="mt-4 font-semibold text-gray-800">4.3 Legal Requirements</h4>
          <p className="mt-2 leading-relaxed">
            We may disclose your information if required by law or in response to valid requests by public authorities (e.g., court orders, government agencies).
          </p>

          <h4 className="mt-4 font-semibold text-gray-800">4.4 Business Transfers</h4>
          <p className="mt-2 leading-relaxed">
            In the event of a merger, acquisition, or sale of assets, your information may be transferred to the acquiring entity.
          </p>
        </section>

        {/* Data Security */}
        <section>
          <h3 className="text-lg font-semibold text-gray-800">5. Data Security</h3>
          <p className="mt-2 leading-relaxed">
            We implement appropriate technical and organizational security measures to protect your personal information, including:
          </p>
          <ul className="mt-2 ml-6 list-disc space-y-1">
            <li>Encryption of data in transit and at rest</li>
            <li>Secure authentication and access controls</li>
            <li>Regular security audits and vulnerability assessments</li>
            <li>Employee training on data protection practices</li>
            <li>Backup and disaster recovery procedures</li>
          </ul>
          <p className="mt-2 leading-relaxed">
            However, no method of transmission over the internet or electronic storage is 100% secure. While we strive to protect your information, we cannot guarantee absolute security.
          </p>
        </section>

        {/* Data Retention */}
        <section>
          <h3 className="text-lg font-semibold text-gray-800">6. Data Retention</h3>
          <p className="mt-2 leading-relaxed">
            We retain your personal information for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law. When you terminate your membership, we may retain certain information for:
          </p>
          <ul className="mt-2 ml-6 list-disc space-y-1">
            <li>Compliance with legal obligations</li>
            <li>Resolution of disputes</li>
            <li>Enforcement of our agreements</li>
            <li>Historical business records and analytics</li>
          </ul>
        </section>

        {/* Your Rights */}
        <section>
          <h3 className="text-lg font-semibold text-gray-800">7. Your Privacy Rights</h3>
          <p className="mt-2 leading-relaxed">
            Depending on your location, you may have the following rights:
          </p>
          <ul className="mt-2 ml-6 list-disc space-y-1">
            <li><strong>Access:</strong> Request access to your personal information</li>
            <li><strong>Correction:</strong> Request correction of inaccurate or incomplete information</li>
            <li><strong>Deletion:</strong> Request deletion of your personal information (subject to legal obligations)</li>
            <li><strong>Portability:</strong> Request a copy of your data in a machine-readable format</li>
            <li><strong>Opt-out:</strong> Opt out of certain data processing activities</li>
            <li><strong>Restriction:</strong> Request restriction of processing in certain circumstances</li>
          </ul>
          <p className="mt-2 leading-relaxed">
            To exercise these rights, please contact us at privacy@senguntharinbusiness.com
          </p>
        </section>

        {/* Children's Privacy */}
        <section>
          <h3 className="text-lg font-semibold text-gray-800">8. Children's Privacy</h3>
          <p className="mt-2 leading-relaxed">
            Our Platform is not intended for individuals under the age of 18. We do not knowingly collect personal information from children. If you believe we have inadvertently collected information from a child, please contact us immediately.
          </p>
        </section>

        {/* International Transfers */}
        <section>
          <h3 className="text-lg font-semibold text-gray-800">9. International Data Transfers</h3>
          <p className="mt-2 leading-relaxed">
            Your information may be transferred to and maintained on servers located outside of your state, province, country, or other governmental jurisdiction where data protection laws may differ. By using our Platform, you consent to such transfers.
          </p>
        </section>

        {/* Cookies */}
        <section>
          <h3 className="text-lg font-semibold text-gray-800">10. Cookies and Tracking Technologies</h3>
          <p className="mt-2 leading-relaxed">
            We use cookies and similar tracking technologies to enhance your experience. You can control cookie preferences through your browser settings. Types of cookies we use:
          </p>
          <ul className="mt-2 ml-6 list-disc space-y-1">
            <li><strong>Essential Cookies:</strong> Required for platform functionality</li>
            <li><strong>Performance Cookies:</strong> Help us understand platform usage</li>
            <li><strong>Functional Cookies:</strong> Remember your preferences</li>
            <li><strong>Analytics Cookies:</strong> Analyze user behavior and improve services</li>
          </ul>
        </section>

        {/* Third-Party Links */}
        <section>
          <h3 className="text-lg font-semibold text-gray-800">11. Third-Party Links</h3>
          <p className="mt-2 leading-relaxed">
            Our Platform may contain links to third-party websites or services. We are not responsible for the privacy practices of these third parties. We encourage you to review their privacy policies.
          </p>
        </section>

        {/* Changes to Privacy Policy */}
        <section>
          <h3 className="text-lg font-semibold text-gray-800">12. Changes to This Privacy Policy</h3>
          <p className="mt-2 leading-relaxed">
            We may update this Privacy Policy from time to time. We will notify you of material changes by:
          </p>
          <ul className="mt-2 ml-6 list-disc space-y-1">
            <li>Posting the updated policy on our Platform</li>
            <li>Updating the "Last Updated" date</li>
            <li>Sending email notifications for significant changes</li>
          </ul>
          <p className="mt-2 leading-relaxed">
            Your continued use of the Platform after changes constitutes acceptance of the updated Privacy Policy.
          </p>
        </section>

        {/* Contact Information */}
        <section>
          <h3 className="text-lg font-semibold text-gray-800">13. Contact Us</h3>
          <p className="mt-2 leading-relaxed">
            If you have questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:
          </p>
          <div className="mt-4 rounded-lg bg-gray-50 p-4">
            <p className="font-semibold">SIB - Sengunthar in Business</p>
            <p className="mt-2">Email: sibconnect2025@gmail.com</p>
            <p>Support Email: senguntharinbusinesserode@gmail.com</p>
            <p>Phone: +91 9842875676</p>
            <p className="mt-2">Address:</p>
            <p>Erode</p>
            <p>Tamilnadu, India</p>
          </div>
        </section>

        {/* Consent */}
        <section>
          <h3 className="text-lg font-semibold text-gray-800">14. Consent</h3>
          <p className="mt-2 leading-relaxed">
            By using the SIB Platform, you acknowledge that you have read, understood, and agree to this Privacy Policy.
          </p>
        </section>

      </div>

      {/* Footer Actions */}
      <div className="mt-8 border-t pt-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            For more information, visit our Help Center
          </p>
        </div>
      </div>
    </div>
  );
}
