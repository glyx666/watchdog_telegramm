const { Telegraf, Markup } = require('telegraf');
const bot = require('./bot.js');

// Функция, которая возвращает объект разметки основного меню
function getMenuMarkup() {
  return Markup.keyboard([
    ['Мониторинг', 'Уведомления'],
    ['Информация', 'Резерв']
  ]).resize();
}
// подменю информация
function getSubMenuMarkup() {
  return Markup.keyboard([
    ['О папке', 'Логи', 'One Drive logs'],
    ['Счетчики', 'Резерв2', 'Назад']
  ]).resize();
}
// Объект разметки основного меню
const mainMenuMarkup = getMenuMarkup();
//подменю мониторинг
function getSubMenuMarkupMonitor() {
  return Markup.keyboard([
    ['Включить мониторинг', 'Выключить мониторинг'],
    ['Назад']
  ]).resize();
}
//подменю уведомления
function getSubMenuMarkupNotify() {
    return Markup.keyboard([
        ['Включить уведомления', 'Выключить уведомления'],
        ['Назад']
    ]).resize();
}

function getSubMenuMarkupLogs() {
  return Markup.keyboard([
      ['Последние 25 записей', 'Последние 50 записей'],
      ['Загрузить последние сутки', 'Назад']
  ]).resize();
}

module.exports = { getMenuMarkup, getSubMenuMarkupLogs, getSubMenuMarkup,getSubMenuMarkupMonitor, getSubMenuMarkupNotify };