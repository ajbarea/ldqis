// research(2026-05): Astro 5 content collections use the new Content Layer
// API. `glob({ pattern, base })` discovers Markdown files at build time;
// IDs are derived from filenames (no reserved `slug` field). Detail-route
// dynamic segments key off `entry.id`. Source:
// https://docs.astro.build/en/guides/content-collections/
// https://docs.astro.build/en/reference/content-loader-reference/
import { glob } from "astro/loaders";
import { defineCollection, z } from "astro:content";

// Projects — open-source frameworks + research artifacts the lab ships.
// Each entry's frontmatter mirrors the prior inline array in index.astro
// (name, tagline, tags[], stack, desc with allowed inline HTML, links[]).
const projects = defineCollection({
  loader: glob({ pattern: "*.md", base: "./src/content/projects" }),
  schema: z.object({
    name: z.string(),
    tagline: z.string(),
    tags: z.array(z.string()),
    stack: z.string(),
    // `desc` retains the inline-HTML escape hatch (e.g. <strong>...</strong>)
    // that the prior inline data leaned on. Markdown body could replace it
    // long-term but the data is short enough that one-line desc stays
    // readable inside frontmatter.
    desc: z.string(),
    links: z.array(z.object({ label: z.string(), href: z.string().url() })).min(1),
    // Ordering: lower numbers render first. Mirrors the prior array order
    // (InteFL → Phalanx-FL → VelocityFL → Kourai Khryseai) without
    // depending on filesystem listing.
    order: z.number().int().nonnegative(),
  }),
});

const publications = defineCollection({
  loader: glob({ pattern: "*.md", base: "./src/content/publications" }),
  schema: z.object({
    year: z.string(),
    venue: z.string(),
    title: z.string(),
    authors: z.string(),
    link: z.object({ label: z.string(), href: z.string().url() }),
    order: z.number().int().nonnegative(),
  }),
});

// People — current + past cohort. `cohort` discriminates the section the
// person lands in on the homepage. `lead: true` reserves the wider card
// for the principal investigator.
const people = defineCollection({
  loader: glob({ pattern: "*.md", base: "./src/content/people" }),
  schema: z.object({
    initials: z.string().min(1).max(3),
    name: z.string(),
    role: z.string(),
    email: z.string().email().optional(),
    cohort: z.enum(["current", "past"]),
    lead: z.boolean().optional(),
    order: z.number().int().nonnegative(),
  }),
});

export const collections = { projects, publications, people };
