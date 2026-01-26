import Link from "next/link";
import { Home } from "lucide-react";

export function AppFooter() {
  return (
    <footer className="w-full bg-secondary/50">
      <div className="container mx-auto px-4 md:px-6 py-6 flex flex-col sm:flex-row items-center justify-between">
        <div className="flex items-center space-x-2">
          <Home className="h-6 w-6 text-primary" />
          <span className="font-bold font-headline">Makikibahay</span>
        </div>
        <p className="text-sm text-muted-foreground mt-4 sm:mt-0">
          © {new Date().getFullYear()} Makikibahay. All rights reserved.
        </p>
        <nav className="flex items-center space-x-4 mt-4 sm:mt-0">
          <Link href="/about" className="text-sm text-muted-foreground hover:text-primary">
            About
          </Link>
          <Link href="/contact" className="text-sm text-muted-foreground hover:text-primary">
            Contact
          </Link>
          <Link href="/privacy" className="text-sm text-muted-foreground hover:text-primary">
            Privacy Policy
          </Link>
        </nav>
      </div>
    </footer>
  );
}
