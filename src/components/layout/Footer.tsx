// src/components/layout/Footer.tsx

import Link from "next/link";

interface FooterProps {
  storeName: string;
}

export const Footer: React.FC<FooterProps> = ({ storeName }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Copyright */}
          <p className="text-sm text-gray-400">
            &copy; {currentYear} {storeName}. All rights reserved.
          </p>

          {/* Links */}
          <div className="flex items-center gap-6 text-sm">
            <Link
              href="/contact"
              className="hover:text-white transition-colors"
            >
              Contact
            </Link>
            <Link
              href="/privacy-policy"
              className="hover:text-white transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms-of-service"
              className="hover:text-white transition-colors"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
