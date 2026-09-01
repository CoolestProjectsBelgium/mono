export function mapCategoriesToVotes(categories: Array<{ id: number, value?: number }>) {
  return categories.map(vote => ({
    id: vote.id,
    value: vote.value || 0,
  }))
}
