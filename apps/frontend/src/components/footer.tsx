import Link from "next/link";
import { Home } from "lucide-react";

export function AppFooter() {
  return (
    <footer className="bg-gray-light border-t border-gray-border mt-16">
      {/* Main footer columns */}
      <div className="max-w-[1400px] mx-auto px-5 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Logo & Intro */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 text-primary-green no-underline mb-4">
              <Home className="h-6 w-6" />
              <span className="text-xl font-black tracking-tight text-primary-green">Makikibahay</span>
            </Link>
            <p className="text-sm text-gray-text leading-relaxed">
              Find your next perfect home in Cabanatuan. Whether it's a solo room, shared space, or studio, Makikibahay connects you directly with trusted property owners.
            </p>
          </div>

          {/* Advertisers */}
          <div>
            <h4 className="text-base font-bold text-text-dark mb-5">Advertisers</h4>
            <ul className="space-y-2.5">
              <li><FooterLink href="/signup?role=owner">Add a Property</FooterLink></li>
              <li><FooterLink href="/owner/dashboard">Customer Portal</FooterLink></li>
              <li><FooterLink href="#">Community Forum</FooterLink></li>
            </ul>
          </div>

          {/* Rental Manager */}
          <div>
            <h4 className="text-base font-bold text-text-dark mb-5">Rental Manager</h4>
            <ul className="space-y-2.5">
              <li><FooterLink href="/owner/dashboard">Properties for Rent</FooterLink></li>
              <li><FooterLink href="#">Screen Applicants</FooterLink></li>
              <li><FooterLink href="#">Collect Rent Online</FooterLink></li>
              <li><FooterLink href="#">Rental Manager Resources</FooterLink></li>
            </ul>
          </div>

          {/* About Us */}
          <div>
            <h4 className="text-base font-bold text-text-dark mb-5">About Us</h4>
            <ul className="space-y-2.5">
              <li><FooterLink href="/about">About Us</FooterLink></li>
              <li><FooterLink href="/contact">Contact Us</FooterLink></li>
              <li><FooterLink href="#">Legal Notices</FooterLink></li>
              <li><FooterLink href="/privacy">Privacy Policy</FooterLink></li>
              <li><FooterLink href="#">Avoid Scams</FooterLink></li>
              <li><FooterLink href="#">Accessibility</FooterLink></li>
              <li><FooterLink href="#">Sitemap</FooterLink></li>
            </ul>
          </div>

        </div>
      </div>

      {/* Footer Bottom Bar */}
      <div className="border-t border-gray-border">
        <div className="max-w-[1400px] mx-auto px-5 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-primary-green">
            <Home className="h-5 w-5" />
            <span className="font-black text-lg tracking-tight">Makikibahay</span>
          </div>
          <p className="text-sm text-gray-text">
            © {new Date().getFullYear()} Makikibahay. All Rights Reserved.
          </p>
          <p className="text-sm text-gray-text">Equal Housing Opportunity 🏠</p>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="text-sm text-gray-text hover:text-primary-green hover:underline transition-colors"
    >
      {children}
    </Link>
  );
}
