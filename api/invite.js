module.exports = async (req, res) => {
  const html = `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Mute Miracle</title>
  <meta property="og:title" content="Mute Miracle — твоё тихое пространство" />
  <meta property="og:description" content="Приложение для здоровья, осознанности и духовных практик. Без навязчивости. Без соцсетей. Только ты и твой ритм." />
  <meta property="og:image" content="https://life-balance-gray.vercel.app/og-image.png" />
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0E1219; color: #E8E6E3; display: flex; align-items: center; justify-content: center; height: 100vh; text-align: center; padding: 20px; }
    .card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 24px; padding: 40px 30px; max-width: 380px; backdrop-filter: blur(20px); }
    h1 { font-weight: 300; font-size: 24px; margin-bottom: 8px; color: #C9A063; }
    p { font-size: 14px; line-height: 1.6; color: #8B8D91; margin-bottom: 24px; }
    .btn { display: inline-block; padding: 14px 32px; background: #C9A063; color: #0E1219; border-radius: 50px; text-decoration: none; font-weight: 500; font-size: 15px; transition: all 0.2s; }
    .btn:hover { background: #d4ad6e; }
    .footer { margin-top: 20px; font-size: 11px; color: #5A5D61; }
  </style>
</head>
<body>
  <div class="card">
    <div style="font-size: 40px; margin-bottom: 16px;">🌿</div>
    <h1>Mute Miracle</h1>
    <p>Тихое пространство для здоровья, осознанности и внутреннего покоя. Без навязчивости. Только ты и твой ритм.</p>
    <a href="https://t.me/MuteM_bot" class="btn">Открыть в Telegram</a>
    <div class="footer">Практика глубже, когда мы рядом</div>
  </div>
</body>
</html>`;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.status(200).send(html);
};