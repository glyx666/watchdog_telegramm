// Подключение необходимых модулей
const { Telegraf } = require('telegraf');
require('dotenv').config();

// Создание объекта бота
const bot = new Telegraf(process.env.BOT_TOKEN);

// Переменная для отслеживания состояния отправки уведомлений
let isNotificationEnabled = true;

// Функция для включения или отключения отправки уведомлений
function toggleNotifications(enabled) {
  isNotificationEnabled = enabled;
}

// Обработчик команды "Включить уведомления"
bot.hears('Включить уведомления', (ctx) => {
  if (!isNotificationEnabled) {
    toggleNotifications(true);
    ctx.reply('Уведомления включены');
  } else {
    ctx.reply('Уведомления уже включены');
  }
});

// Обработчик команды "Отключить уведомления"
bot.hears('Выключить уведомления', (ctx) => {
  if (isNotificationEnabled) {
    toggleNotifications(false);
    ctx.reply('Уведомления отключены');
  } else {
    ctx.reply('Уведомления уже отключены');
  }
});

// Вызов функции для включения или отключения уведомлений
toggleNotifications(true); // Включение уведомлений

// Запуск бота
bot.launch();