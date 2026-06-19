const { Bot } = require('grammy');
const { createClient } = require('@supabase/supabase-js');

const bot = new Bot(process.env.BOT_TOKEN || '');
const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

// Инициализация бота
let botReady = false;
bot.init().then(() => { botReady = true; });

bot.command('start', async (ctx) => {
  const telegramId = ctx.from?.id;
  console.log('Start from:', telegramId, 'chat:', ctx.chat.id);
  if (telegramId) {
    await supabase.from('users').upsert({
      id: telegramId,
      telegram_chat_id: ctx.chat.id,
    });
  }
  await ctx.reply('🌿 Тишина услышана...', {
  reply_markup: { inline_keyboard: [[{ text: 'Открыть Mute Miracle', url: 'https://t.me/MuteM_bot/mutemiracle

' }]] }
});
});

module.exports = async (req, res) => {
  if (req.method === 'POST') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      if (!botReady) await bot.init();
      await bot.handleUpdate(body);
      res.status(200).json({ ok: true });
    } catch (e) {
      console.error('Bot error:', e.message);
      res.status(200).json({ ok: true });
    }
  } else {
    res.status(200).json({ ok: true });
  }
};