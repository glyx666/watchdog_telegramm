const { Telegraf, Markup } = require('telegraf');
const bot = require('./bot.js');

// Функция, которая возвращает объект разметки основного меню
function getMenuMarkup() {
  return Markup.keyboard([
    ['Мониторинг', 'Информация', 'Уведомления'],
    ['Приостановить на 1 час', 'Скачать файл', 'One Drive logs']
  ]).resize();
}

// Функция, которая возвращает объект разметки подменю
function getSubMenuMarkup() {
  return Markup.keyboard([
    ['О папке', 'логи 3 часа', '6 часов'],
    ['12 часов', '24 часа', 'Назад']
  ]).resize();
}
// Объект разметки основного меню
const mainMenuMarkup = getMenuMarkup();

function getSubMenuMarkupMonitor() {
  return Markup.keyboard([
    ['Включить мониторинг', 'Выключить мониторинг'],
    ['Назад']
  ]).resize();
}

function getSubMenuMarkupNotify() {
    return Markup.keyboard([
        ['Включить уведомления', 'Выключить уведомления'],
        ['Назад']
    ]).resize();
}
    
module.exports = { getMenuMarkup, getSubMenuMarkup,getSubMenuMarkupMonitor, getSubMenuMarkupNotify };