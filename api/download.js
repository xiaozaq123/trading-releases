export default async function handler(req, res) {
  const pwd = req.query.password || '';
  if (pwd !== process.env.PASSWORD) {
    return res.status(401).json({ error: '密码错误' });
  }
  const tag = req.query.tag;
  if (!tag) return res.status(400).json({ error: '缺少 tag' });
  try {
    const r = await fetch(
      `https://api.github.com/repos/${process.env.GH_OWNER}/${process.env.GH_REPO}/releases/tags/${encodeURIComponent(tag)}`,
      { headers: { Authorization: `Bearer ${process.env.GH_TOKEN}` } }
    );
    const release = await r.json();
    const asset = release.assets?.[0];
    if (!asset) return res.status(404).json({ error: '未找到文件' });
    const dl = await fetch(asset.url, {
      headers: { Authorization: `Bearer ${process.env.GH_TOKEN}`, Accept: 'application/octet-stream' },
      redirect: 'manual'
    });
    const location = dl.headers.get('location');
    if (location) {
      res.writeHead(302, { Location: location }); res.end();
    } else {
      res.writeHead(302, { Location: asset.browser_download_url }); res.end();
    }
  } catch { res.status(500).json({ error: '下载失败' }); }
}
