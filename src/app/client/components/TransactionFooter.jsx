"use client";

import { ExternalLink } from "lucide-react";

export default function TransactionFooter() {
  const linkClass =
    "flex items-center gap-2 text-[#1a5ea8] hover:underline text-sm";

  return (
    <footer className="mt-20">

      {/* TOP FOOTER */}
      <div className="bg-[#f4f4f4] py-12 px-10">

        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 text-[#1f1f1f]">

          {/* APPLY NOW */}
          <div>
            <h3 className="font-medium mb-6 text-gray-700">Apply Now</h3>

            <div className="space-y-4">

              <a className={linkClass}>
                Explore Personal Banking Accounts
                <ExternalLink size={16} />
              </a>

              <a className={linkClass}>
                Account Selector Tool
                <ExternalLink size={16} />
              </a>

              <a className={linkClass}>
                Open a New Account
                <ExternalLink size={16} />
              </a>

            </div>
          </div>

          {/* RATES */}
          <div>
            <h3 className="font-medium mb-6 text-gray-700">
              Rates and Fees
            </h3>

            <div className="space-y-4">

              <a className={linkClass}>
                Additional Service Fee
                <ExternalLink size={16} />
              </a>

              <a className={linkClass}>
                Account Interest Rates
                <ExternalLink size={16} />
              </a>

            </div>
          </div>

          {/* TIPS */}
          <div>
            <h3 className="font-medium mb-6 text-gray-700">
              Tips and Resources
            </h3>

            <div className="space-y-4">

              <a className={linkClass}>
                Savings Spot
                <ExternalLink size={16} />
              </a>

              <a className={linkClass}>
                Multi Product Rebate
                <ExternalLink size={16} />
              </a>

            </div>
          </div>

          {/* SECURITY */}
          <div>
            <h3 className="font-medium mb-6 text-gray-700">
              Security
            </h3>

            <div className="space-y-4">

              <a className={linkClass}>
                Report a Security Concern
                <ExternalLink size={16} />
              </a>

              <a className={linkClass}>
                Report a Lost or Compromised Card
                <ExternalLink size={16} />
              </a>

              <a className={linkClass}>
                Online Banking Security Guarantee
                <ExternalLink size={16} />
              </a>

            </div>
          </div>

        </div>

      </div>

      {/* BOTTOM BAR */}
      <div className="bg-[#4a4a4a] text-white py-4 px-10">

        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center text-sm">

          <p>Royal Bank of Canada Website, © 1995-2026</p>

          <div className="flex items-center gap-6 mt-2 md:mt-0">

            <a className="flex items-center gap-2 hover:underline">
              Legal
              <ExternalLink size={16} />
            </a>

            <span>|</span>

            <a className="flex items-center gap-2 hover:underline">
              Accessibility
              <ExternalLink size={16} />
            </a>

            <span>|</span>

            <a className="flex items-center gap-2 hover:underline">
              Privacy & Security
              <ExternalLink size={16} />
            </a>

            <span>|</span>

            <a className="hover:underline">
              Advertising & Cookies
            </a>

          </div>

        </div>

      </div>

    </footer>
  );
}