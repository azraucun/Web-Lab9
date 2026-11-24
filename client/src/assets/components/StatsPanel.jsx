export default function StatsPanel({ stats }) {
  if (!stats) {
    return <p>Loading statistics...</p>;
  }
  return (
    <section className="stats">
      <h2>Statistics</h2>
      <p>
        Total: {stats.total} | Read: {stats.read} | Unread: {stats.unread} | Average rating:{' '}
        {stats.averageRating ?? 'none'}
      </p>
      <p>
        {Object.entries(stats.byGenre)
          .map(([genre, count]) => `${genre}: ${count}`)
          .join(' | ')}
      </p>
    </section>
  );
}