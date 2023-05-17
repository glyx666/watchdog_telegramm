//Подключение модулей:
const { Telegraf } = require('telegraf');
const { Markup } = require('telegraf');
const chokidar = require('chokidar');
require('dotenv').config();
const fs = require("fs");
const { getMenuMarkup, getSubMenuMarkup, getSubMenuMarkupMonitor, getSubMenuMarkupNotify } = require('./menu');
const { postStatistics, updateStats, getFileType } = require('./stats');
const { createReadStream } = require('fs');
const { logChanges } = require('./logging');
const { promisify } = require('util');
const { findAndSendFile } = require('./finder')
//Создание объекта бота:
const bot = new Telegraf(process.env.BOT_TOKEN);
//Настройка отслеживания папки и обработчик событий:
let isMonitoring = false;// флаг для проверки запущен ли уже мониторинг
// Переменная для отслеживания состояния отправки уведомлений
let isNotificationEnabled = true;
let watcher = chokidar.watch(process.env.FOLDER_PATH, {
  ignored: /^\./,
  ignoreInitial: true,
});
const menuMarkup = getMenuMarkup();
//Обработчики команд и кнопок:
// Функция для включения или отключения мониторинга
function toggleMonitoring(enabled) {
  if (enabled) {
    // Включение мониторинга
    if (!isMonitoring) {
      logChanges('Мониторинг включен');
      watcher = chokidar.watch(process.env.FOLDER_PATH, {
        ignored: /^\./,
        ignoreInitial: true,
      });

      watcher.on('add', (path) => {
        console.log(`New file added: ${path}`);
        logChanges(`New file added: ${path}`);
        if (isMonitoring && isNotificationEnabled) {
          bot.telegram.sendMessage(
            process.env.CHAT_ID,
            `Новый файл добавлен: ${path}`
          );
        }
      });

      watcher.on('change', (path) => {
        console.log(`File changed: ${path}`);
        logChanges(`File changed: ${path}`);
        if (isMonitoring && isNotificationEnabled) {
          bot.telegram.sendMessage(
            process.env.CHAT_ID,
            `Файл изменен: ${path}`
          );
        }
      });

      isMonitoring = true;
    }
  } else {
    // Отключение мониторинга
    if (isMonitoring) {
      logChanges('Мониторинг выключен');
      watcher.close();
      isMonitoring = false;
    }
  }
}

// Функция для включения или отключения отправки уведомлений
function toggleNotifications(enabled) {
  isNotificationEnabled = enabled;
}

// Обработчик команды "Включить мониторинг"
bot.command('check', (ctx) => {
  logChanges('Команда check выполнена');
  toggleMonitoring(true);
  sendMenu(ctx);
  ctx.reply(`Начинаю отслеживание папки: ${process.env.FOLDER_PATH}`);
});

// Обработчик команды "Отключить мониторинг"
bot.command('uncheck', (ctx) => {
  logChanges('Команда uncheck выполнена');
  toggleMonitoring(false);
  sendMenu(ctx);
  ctx.reply(`Прекращаю отслеживание папки: ${process.env.FOLDER_PATH}`);
});
// Обработчик команды "Включить уведомления"
bot.hears('Включить уведомления', (ctx) => {
  if (!isNotificationEnabled) {
    toggleNotifications(true);
    ctx.reply('Уведомления включены');
  } else {
    ctx.reply('Уведомления уже включены');
  }
});

// Обработчик команды "Выключить уведомления"
bot.hears('Выключить уведомления', (ctx) => {
  if (isNotificationEnabled) {
    toggleNotifications(false);
    ctx.reply('Уведомления отключены');
  } else {
    ctx.reply('Уведомления уже отключены');
  }
});

// Обработчик команды "Включить мониторинг"
bot.hears('Включить мониторинг', (ctx) => {
  if (!isMonitoring) {
    logChanges('Мониторинг включен');
    toggleMonitoring(true);
    ctx.reply('Мониторинг запущен');
  } else {
    ctx.reply('Мониторинг уже запущен');
  }
});

// Обработчик команды "Выключить мониторинг"
bot.hears('Выключить мониторинг', (ctx) => {
  if (isMonitoring) {
    logChanges('Мониторинг выключен');
    toggleMonitoring(false);
    ctx.reply('Мониторинг остановлен');
  } else {
    ctx.reply('Мониторинг уже остановлен');
  }
});

bot.hears('Мониторинг',(ctx) => {
  const SubMenuMarkupMonitor = getSubMenuMarkupMonitor();
  ctx.reply('Выберите:', SubMenuMarkupMonitor);
});

bot.hears('Уведомления',(ctx) => {
  const SubMenuMarkupNotify = getSubMenuMarkupNotify();
  ctx.reply('Выберите:', SubMenuMarkupNotify);
});

bot.hears('Информация', (ctx) => {
  const SubMenuMarkup = getSubMenuMarkup();
  ctx.reply('Выберите:', SubMenuMarkup);
});

bot.hears('О папке', async (ctx) => {
  const stats = await updateStats();
  postStatistics(ctx);
});
// Обработчик кнопки "Назад"


bot.hears('Пауза на 1 час', (ctx) => {
  ctx.reply('Должна остановить отправку сообщений на 1 час , кроме конкретных отслеживаемых файлов');
});

// Команда /download для поиска и отправки файла
bot.command('Скачать файл', async (ctx) => {
  const folderPath = process.env.FOLDER_PATH; // Путь к папке, которую нужно отслеживать
  await findAndSendFile(ctx, folderPath);
});

bot.hears('One Drive logs', (ctx) => {
  ctx.reply('One Drive  логи: https://1drv.ms/f/s!AuVxNFZKlGyMgYpHZvyfbk704Vemuw');
});
// Пример, вызов функции collectStatistics каждый час 
setInterval(() => {
  updateStats()
    .then((stats) => {
      // тут можно обработать полученную статистику, но вызывать функцию postStatistics не нужно
    })
    .catch((err) => {
      console.error(err);
    });
}, 1000 * 60 * 10);// интервал (в мсек) сохранения инфы в бд 

function sendMenu(ctx) {
  const menuMarkup = getMenuMarkup();
  ctx.reply('Выберите действие:', menuMarkup);
}

// Обработчик кнопки "Назад"
bot.hears('Назад', (ctx) => {
  sendMenu(ctx);
});

bot.start();
//Запуск бота:
bot.launch();
logChanges('Бот запущен');
bot.telegram.sendMessage(process.env.CHAT_ID, 'Выберите действие:')
  .then(() => {
    logChanges('Уведомление отправлено');
    console.log('Уведомление отправлено');
  })
  .catch((e) => {
    console.error(e);
  });

console.log('Bot has been started...');
module.exports = { 
  bot, 
  sendMenu
};