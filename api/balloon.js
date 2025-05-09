export default async function handler(req, res) {
  const allData = [];

  // Try to fetch 00 through 23.json
  for (let i = 0; i <= 23; i++) {
    const padded = i.toString().padStart(2, '0');
    const url = `https://a.windbornesystems.com/treasure/${padded}.json`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      allData.push(...data); // flatten
    } catch (err) {
      console.warn(`Skipping ${url} due to error.`);
    }
  }

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.status(200).json(allData);
}
