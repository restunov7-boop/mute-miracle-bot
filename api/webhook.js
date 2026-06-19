const { Bot } = require('grammy');
const { createClient } = require('@supabase/supabase-js');

const bot = new Bot(process.env.BOT_TOKEN || '');
const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

let botReady = false;
bot.init().then(() => { botReady = true; });

bot.command('start', async (ctx) => {
  const telegramId = ctx.from?.id;
  if (telegramId) {
    await supabase.from('users').upsert({
      id: telegramId,
      telegram_chat_id: ctx.chat.id,
    });
  }
  await ctx.reply('🌿 Тишина услышана. Я буду напоминать тебе о саде и круге.', {
    reply_markup: { inline_keyboard: [[{ text: 'Открыть Mute Miracle', url: 'https://t.me/MuteM_bot/mutemiracle' }]] }
  });
});

bot.command('buy_master', async (ctx) => {
  await ctx.api.sendInvoice(
    ctx.chat.id,
    'Тишина Мастеров',
    'Доступ к закрытому кругу с проводником на 1 месяц',
    'master_circle_sub_1m',
    '',
    'XTR',
    [{ label: 'Доступ на 1 месяц', amount: 50 }]
  );
});

bot.command('master_status', async (ctx) => {
  const telegramId = ctx.from?.id;
  const { data: user } = await supabase.from('users')
    .select('has_master_circle, master_circle_expires')
    .eq('id', telegramId).single();

  if (user?.has_master_circle && new Date(user.master_circle_expires) > new Date()) {
    await ctx.reply(`✅ Доступ активен до ${new Date(user.master_circle_expires).toLocaleDateString()}`);
  } else {
    await ctx.reply('❌ Нет доступа. Напиши /buy_master');
  }
});

bot.on('pre_checkout_query', (ctx) => ctx.answerPreCheckoutQuery(true));

bot.on('successful_payment', async (ctx) => {
  const telegramId = ctx.from?.id;
  await supabase.from('users').upsert({
    id: telegramId,
    has_master_circle: true,
    master_circle_expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  });
  await ctx.reply('🌙 Ты в Круге Мастеров. Возвращайся в приложение.', {
    reply_markup: { inline_keyboard: [[{ text: 'Открыть Mute Miracle', url: 'https://t.me/MuteM_bot/mutemiracle' }]] }
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