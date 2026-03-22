async function test() {
  const res = await fetch('http://localhost:3000/api/activities?lat=-0.1806&lng=-78.4678&radius=100&guests=2&startDate=2026-03-20&endDate=2026-03-25');
  const data = await res.json();
  console.log('Results with advanced filters:', data.length || data);
}
test();
