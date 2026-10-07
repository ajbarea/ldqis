/** Primary navigation, shared by the header and the RIT footer. */
export function primaryLinks(baseUrl: string) {
  const base = baseUrl.replace(/\/$/, "");
  return [
    { href: `${base}/#research`, label: "Research" },
    { href: `${base}/#projects`, label: "Projects" },
    { href: `${base}/#publications`, label: "Publications" },
    { href: `${base}/#people`, label: "People" },
    { href: `${base}/news/`, label: "News" },
  ];
}

/** The lab's own footer links, shared across pages; anchors are absolute so they work off the homepage. */
export function footerGroups(baseUrl: string) {
  const base = baseUrl.replace(/\/$/, "");
  return [
    {
      heading: "Research",
      links: [
        { href: `${base}/#research`, label: "Areas" },
        { href: `${base}/#publications`, label: "Recent publications" },
        { href: `${base}/#projects`, label: "Open-source" },
        { href: `${base}/#funding`, label: "Funded by" },
      ],
    },
    {
      heading: "Lab",
      links: [
        { href: `${base}/#people`, label: "Current team" },
        { href: `${base}/#people`, label: "Alumni" },
        { href: `${base}/#teaching`, label: "Teaching" },
        { href: "mailto:lrvcs@rit.edu?subject=Joining%20LDQIS", label: "Join us" },
        { href: "mailto:lrvcs@rit.edu", label: "Get in touch" },
        {
          href: "https://scholar.google.com/citations?user=cKqeJEgAAAAJ&hl=en",
          label: "Google Scholar",
        },
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
