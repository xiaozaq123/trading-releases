export default async function handler(req, res) {
  const pwd = req.query.password || '';
  if (pwd !== process.env.PASSWORD) {
    return res.status(401).json({ error: '密码错误' });
  }
  try {
    const r = await fetch(
      `https://api.github.com/repos/${process.env.GH_OWNER}/${process.env.GH_REPO}/releases`,
      { headers: { Authorization: `Bearer ${process.env.GH_TOKEN}` } }
    );
    const data = await r.json();
    const list = data.filter(r => !r.draft).map(r => {
      const m = r.tag_name.match(/^v?([\d.]+)-(prod|sit)-(android|ios)$/i);
      if (!m) return null;
      const a = r.assets?.[0];
      return { version: m[1], env: m[2].toLowerCase(), platform: m[3].toLowerCase(), tag: r.tag_name, size: a?.size || 0, published_at: r.published_at };
    }).filter(Boolean);
    res.json(list);
  } catch { res.status(500).json({ error: '获取失败' }); }
}
