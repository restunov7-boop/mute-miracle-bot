const { Bot } = require('grammy');
const { createClient } = require('@supabase/supabase-js');

const bot = new Bot(process.env.BOT_TOKEN || '');
const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

bot.command('start', async (ctx) => {
  const telegramId = ctx.from?.id;
  if (telegramId) {
    await supabase.from('users').upsert({
      id: telegramId,
      telegram_chat_id: ctx.chat.id,
    });
  }
  await ctx.reply('Тишина услышана. Я буду напоминать тебе о саде и круге.');
});

module.exports = async (req, res) => {
  if (req.method === 'POST') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      await bot.handleUpdate(body);
      res.status(200).end();
    } catch (e) {
      console.error(e);
      res.status(500).end();
    }
  } else {
    res.status(200).json({ ok: true });
  }
};