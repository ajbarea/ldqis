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
