// Publications sort newest-first (oldest last), same-year ties broken by title
// for determinism. Replaces the hand-set `order` field with derived position.
type PublicationLike = { data: { year: string; title: string } };

export function byRecency(a: PublicationLike, b: PublicationLike): number {
  return Number(b.data.year) - Number(a.data.year) || a.data.title.localeCompare(b.data.title);
}
