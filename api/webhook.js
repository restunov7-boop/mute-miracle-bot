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
  await ctx.reply('🌿 Тишина услышана. Я буду напоминать тебе о саде и круге.');
});

bot.command('buy_master', async (ctx) => {
  const telegramId = ctx.from?.id;
  const CRYPTO_TOKEN = process.env.CRYPTO_TOKEN || '';

  const res = await fetch('https://pay.crypt.bot/api/createInvoice', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Crypto-Pay-API-Token': CRYPTO_TOKEN,
    },
    body: JSON.stringify({
      asset: 'USDT',
      amount: '3',
      description: 'Тишина Мастеров — доступ на 1 месяц',
      payload: `master_${telegramId}`,
    }),
  });

  const data = await res.json();
  if (data.ok) {
    await ctx.reply(`💎 Оплати ${data.result.amount} ${data.result.asset}:`, {
      reply_markup: {
        inline_keyboard: [[{ text: '💳 Оплатить', url: data.result.bot_invoice_url }]]
      }
    });
  } else {
    await ctx.reply('Ошибка. Попробуй позже.');
  }
});

bot.command('master_status', async (ctx) => {
  const telegramId = ctx.from?.id;
  const { data: user } = await supabase.from('users')
    .select('has_master_circle, master_circle_expires')
    .eq('id', telegramId).single();

  if (user?.has_master_circle && new Date(user.master_circle_expires) > new Date()) {
    await ctx.reply('✅ Доступ активирован! Возвращайся в приложение.');
  } else {
    await ctx.reply('❌ Нет доступа. Напиши /buy_master');
  }
});

bot.on('pre_checkout_query', (ctx) => ctx.answerPreCheckoutQuery(true));

bot.on('message:successful_payment', async (ctx) => {
  const telegramId = ctx.from?.id;
  await supabase.from('users').upsert({
    id: telegramId,
    has_master_circle: true,
    master_circle_expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  });
  await ctx.reply('🌙 Ты в Круге Мастеров. Возвращайся в приложение.');
});

module.exports = async (req, res) => {
  // Crypto Bot webhook
  if (req.headers['x-request-signature']) {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      if (body.update_type === 'invoice_paid') {
        const payload = body.payload?.payload;
        const telegramId = parseInt(payload?.replace('master_', ''));
        if (telegramId) {
          await supabase.from('users').upsert({
            id: telegramId,
            has_master_circle: true,
            master_circle_expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          });
          await bot.api.sendMessage(telegramId, '✅ Оплата получена! Ты в Круге Мастеров. Возвращайся в приложение.', {
            reply_markup: { inline_keyboard: [[{ text: 'Открыть', url: 'https://t.me/MuteM_bot/mutemiracle' }]] }
          });
        }
      }
      return res.status(200).json({ ok: true });
    } catch (e) {
      return res.status(200).json({ ok: true });
    }
  }

  // Telegram webhook
  if (req.method === 'POST') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      if (!botReady) await bot.init();
      await bot.handleUpdate(body);
      res.status(200).json({ ok: true });
    } catch (e) {
      console.error(e.message);
      res.status(200).json({ ok: true });
    }
  } else {
    res.status(200).json({ ok: true });
  }
};
bot.command('activate', async (ctx) => {
  const telegramId = ctx.from?.id;
  
  // Проверяем, есть ли оплата через Crypto Bot API
  const CRYPTO_TOKEN = process.env.CRYPTO_TOKEN || '';
  const res = await fetch('https://pay.crypt.bot/api/getInvoices', {
    method: 'GET',
    headers: { 'Crypto-Pay-API-Token': CRYPTO_TOKEN },
  });
  const data = await res.json();
  
  if (data.ok) {
    const paid = data.result.items.find((inv) => 
      inv.payload === `master_${telegramId}` && inv.status === 'paid'
    );
    
    if (paid) {
      await supabase.from('users').upsert({
        id: telegramId,
        has_master_circle: true,
        master_circle_expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      });
      await ctx.reply('✅ Доступ активирован! Возвращайся в приложение.');
    } else {
      await ctx.reply('❌ Оплата не найдена. Оплати через /buy_master');
    }
  } else {
    await ctx.reply('Ошибка проверки. Попробуй позже.');
  }
});