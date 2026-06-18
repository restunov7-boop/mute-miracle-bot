const { Bot, webhookCallback } = require('grammy');
const { createClient } = require('@supabase/supabase-js');

const bot = new Bot(process.env.BOT_TOKEN);
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

bot.command('start', async (ctx) => {
  const telegramId = ctx.from?.id;
  if (telegramId) {
    await supabase.from('users').upsert({ id: telegramId, telegram_chat_id: ctx.chat.id });
  }
  await ctx.reply('🌿 Тишина услышана. Я буду напоминать тебе о саде и круге.');
});

module.exports = webhookCallback(bot, 'std/http');