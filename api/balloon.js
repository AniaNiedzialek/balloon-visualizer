export default async function handler(req, res) {
  try {
    const allBalloons = [];

    for (let i = 0; i <= 23; i++) {
      const hour = i.toString().padStart(2, '0');
      const url = `https://a.windbornesystems.com/treasure/${hour}.json`;

      try {
        const response = await fetch(url);
        const data = await response.json();
        allBalloons.push(...data); // flatten the array
      } catch (err) {
        console.warn(`Failed to fetch ${hour}.json`, err.message);
      }
    }

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).json(allBalloons);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch balloon data' });
  }
}
