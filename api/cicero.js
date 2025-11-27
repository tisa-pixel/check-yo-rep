export default async function handler(req, res) {
  const { search_loc } = req.query;
  const CICERO_API_KEY = process.env.CICERO_API_KEY || 'cf23d3bc3e82c86f51b09cd512ca8e7db5a6f4cc';

  if (!search_loc) {
    return res.status(400).json({ error: 'search_loc parameter required' });
  }

  try {
    const response = await fetch(
      `https://cicero.azavea.com/v3.1/official?search_loc=${encodeURIComponent(search_loc)}&key=${CICERO_API_KEY}`
    );

    const data = await response.json();

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 's-maxage=3600');

    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch representatives' });
  }
}
