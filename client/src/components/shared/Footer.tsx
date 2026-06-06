"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useSettingsStore } from "@/store/settings-store";
import api from "@/lib/options";
import { API } from "@/lib/endpoints";

interface HelpLink {
  label: string;
  slug: string;
}

// SVG social icons — inline since lucide-react v1.x doesn't include brand icons
const SOCIAL_SVGS: Record<string, React.ReactNode> = {
  facebook: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  ),
  instagram: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
    </svg>
  ),
  twitter: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  ),
  x: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  ),
  youtube: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.4a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
      <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="white" />
    </svg>
  ),
  linkedin: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  ),
  github: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
      <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  ),
};

const FALLBACK_ICON = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

export function Footer() {
  const { settings } = useSettingsStore();
  const footer = settings.footer || {};
  const [helpLinks, setHelpLinks] = useState<HelpLink[]>([]);

  useEffect(() => {
    api.get(API.common.helpPages)
      .then(({ data }) => {
        if (data.success && data.data) setHelpLinks(data.data);
      })
      .catch(() => {/* silent */});
  }, []);

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Brand */}
        <div>
          {settings.logo ? (
            <img src={settings.logo} alt={settings.appName} className="h-10 mb-4 brightness-200" />
          ) : (
            <h3 className="text-2xl font-bold text-white font-playfair mb-4">
              {settings.appName || "SG"}
            </h3>
          )}
          <p className="text-sm leading-relaxed text-gray-400">
            {footer.about || "Your one-stop destination for all fashion needs. Quality products, great prices."}
          </p>
          {footer.socialLinks && (
            <div className="flex gap-3 mt-4">
              {Object.entries(footer.socialLinks).map(([platform, url]) => (
                url && (
                  <a
                    key={platform}
                    href={url as string}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={platform}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {SOCIAL_SVGS[platform.toLowerCase()] ?? FALLBACK_ICON}
                  </a>
                )
              ))}
            </div>
          )}
        </div>

        {/* Help */}
        <div>
          <h4 className="text-white font-semibold mb-4">Help</h4>
          <ul className="flex flex-col gap-2">
            {helpLinks.length > 0 ? (
              helpLinks.map((link, i) => (
                <li key={i}>
                  <Link
                    href={`/shop/help/${link.slug}`}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))
            ) : (
              <li><span className="text-sm text-gray-500 italic">No help links added yet.</span></li>
            )}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="text-white font-semibold mb-4">Contact</h4>
          <ul className="flex flex-col gap-2 text-sm text-gray-400">
            {footer.contactEmail && <li>✉ {footer.contactEmail}</li>}
            {footer.contactPhone && <li>📞 {footer.contactPhone}</li>}
            {settings.phone && !footer.contactPhone && <li>📞 {settings.phone}</li>}
            {footer.contactAddress && <li>📍 {footer.contactAddress}</li>}
          </ul>
        </div>
      </div>

      <div className="border-t border-gray-800 py-4 text-center text-xs text-gray-500">
        {footer.bottomText || `© ${new Date().getFullYear()} ${settings.appName || "SG"}. All rights reserved.`}
      </div>
    </footer>
  );
}
