require('dotenv').config();

const { bot } = require('./bot');
const { getMenuMarkup, getSubMenuMarkup } = require('./menu');
const { collectStatistics, postStatistics } = require('./stats');

bot.telegram.sendMessage(process.env.CHAT_ID, 'Здравствуйте, бот запущен...', {
  reply_markup: getMenuMarkup()
})
  .then(() => console.log('Кнопки меню отправлены в чат'))
  .catch((e) => console.error(e));

console.log(`Бот запущен, приветствие отправлено`);