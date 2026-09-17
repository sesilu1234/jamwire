import React from 'react';
import { BRAND } from '@/lib/brand';

export default function PrivacyPage() {
  return (
    <main className="max-w-3xl mx-auto p-8 pt-24 text-tone-1 leading-relaxed">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>

      <p className="mb-4 opacity-65">
        Last updated:{' '}
        {new Date().toLocaleDateString('en-US', {
          month: 'long',
          year: 'numeric',
        })}
      </p>

      <section className="gap-6 flex flex-col">
        <div>
          <h2 className="text-xl font-semibold mb-2">
            1. Information We Collect
          </h2>
          <p>
            {BRAND.name} is an informational platform. We do not require users to
            create an account to browse. If you contact us via email, we will
            only use your information to respond to your inquiry.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">
            2. Cookies and Tracking
          </h2>
          <p>
            We may use basic analytical cookies to understand how users interact
            with our website to improve the service. If we display
            advertisements, third-party vendors (including Google) may use
            cookies to serve ads based on your prior visits.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">
            3. Third-Party Links and Content
          </h2>
          <p>
            Our site contains images and links to third-party platforms like
            Instagram. We are not responsible for the privacy practices or
            content of these external sites.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">4. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy or wish to
            request the removal of any content, please contact us through our
            contact section.
          </p>
        </div>
      </section>
    </main>
  );
}
