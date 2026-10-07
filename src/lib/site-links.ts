/** The site base without its trailing slash, for building absolute paths. */
export const basePath = (baseUrl: string) => baseUrl.replace(/\/$/, "");

/** Dr. Reznik's Google Scholar profile. */
export const SCHOLAR_URL = "https://scholar.google.com/citations?user=cKqeJEgAAAAJ&hl=en";

/** The lab's public contact address. */
export const CONTACT_EMAIL = "lrvcs@rit.edu";

/** Primary navigation, shared by the header and the RIT footer. */
export function primaryLinks(baseUrl: string) {
  const base = basePath(baseUrl);
  return [
    { href: `${base}/#research`, label: "Research" },
    { href: `${base}/#projects`, label: "Projects" },
    { href: `${base}/#publications`, label: "Publications" },
    { href: `${base}/#people`, label: "People" },
    { href: `${base}/news/`, label: "News" },
  ];
}

/** Footer link columns. Absolute paths, so they work off the homepage; no two go to the same place. */
export function footerGroups(baseUrl: string) {
  const base = basePath(baseUrl);
  return [
    { heading: "Explore", links: primaryLinks(baseUrl) },
    {
      heading: "Lab",
      links: [
        { href: `${base}/#funding`, label: "Funded by" },
        { href: `${base}/#alumni`, label: "Alumni" },
        { href: `${base}/#teaching`, label: "Teaching" },
        { href: `mailto:${CONTACT_EMAIL}?subject=Joining%20LDQIS`, label: "Join us" },
        { href: `mailto:${CONTACT_EMAIL}`, label: "Get in touch" },
        { href: SCHOLAR_URL, label: "Dr. Reznik on Google Scholar" },
      ],
    },
  ];
}

/** RIT-required footer pages, at their final URLs. */
export const RIT_LEGAL_LINKS = [
  { href: "https://www.rit.edu/land-acknowledgment", label: "Land Acknowledgment" },
  { href: "https://www.rit.edu/disclaimer", label: "Disclaimer" },
  { href: "https://www.rit.edu/copyright-infringement", label: "Copyright Infringement" },
  { href: "https://www.rit.edu/legalcomplianceaudit/privacy-rit", label: "Privacy Statement" },
  { href: "https://www.rit.edu/nondiscrimination", label: "Nondiscrimination" },
  { href: "https://www.rit.edu/emergency-information", label: "Emergency Information" },
  { href: "https://www.rit.edu/accessibility", label: "Accessibility" },
] as const;
