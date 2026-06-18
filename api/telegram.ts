import { Bot, webhookCallback } from 'grammy';
import { createClient } from '@supabase/supabase-js';

const BOT_TOKEN = process.env.BOT_TOKEN!;
const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const bot = new Bot(BOT_TOKEN);
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

bot.command('start', async (ctx) => {
  const telegramId = ctx.from?.id;
  const chatId = ctx.chat.id;

  if (telegramId) {
    await supabase.from('users').upsert({ id: telegramId, telegram_chat_id: chatId });
  }

  await ctx.reply(
    '🌿 Тишина услышана. Я буду напоминать тебе о саде и круге.',
    { reply_markup: { inline_keyboard: [[{ text: 'Открыть Mute Miracle', url: 'https://t.me/life_balance_w_bot/app' }]] } }
  );
});

export const POST = webhookCallback(bot, 'std/http');