require('dotenv').config();

const { bot } = require('./bot');
const { getMenuMarkup, getSubMenuMarkupLogs, getSubMenuMarkup, getSubMenuMarkupMonitor, getSubMenuMarkupNotify } = require('./menu');
const { collectStatistics, postStatistics } = require('./stats');

bot.telegram.sendMessage(process.env.CHAT_ID, 'Здравствуйте, бот запущен...-> \nНажмите /start -> \nМониторинг -> Включить', {
  reply_markup: getMenuMarkup()
})
  .then(() => console.log('Кнопки меню отправлены в чат'))
  .catch((e) => console.error(e));

console.log(`Бот запущен, приветствие отправлено`);
