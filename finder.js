const { promisify } = require('util');
const { createReadStream } = require('fs');
const glob = require('glob');
const path = require('path');
const { Telegraf } = require('telegraf');
const readFileAsync = promisify(createReadStream);
const bot = new Telegraf(process.env.BOT_TOKEN);

// Функция для поиска файла в директории folderPath с заданным именем
const findFile = async (folderPath, filename) => {
  return new Promise((resolve, reject) => {
    glob(`${folderPath}/**/*${filename}*`, {}, (err, files) => {
      if (err) {
        reject(err);
      } else {
        const file = files.find(file => path.basename(file) === filename);
        resolve(file ? file : null);
      }
    });
  });
};

// Функция для отправки файла пользователю
const sendFile = (file, ctx) => {
  return readFileAsync(file)
    .then(fileContent => {
      ctx.replyWithDocument({ source: fileContent, filename: path.basename(file) });
    })
    .catch(err => {
      console.log(err);
      ctx.reply(`Не удалось загрузить файл ${path.basename(file)}`);
    });
};


// Функция findAndSendFile экспортируется для использования в bot.js
const findAndSendFile = async (ctx, folderPath) => {
  ctx.reply('Введите название файла:');
  try {
    const filenameMsg = await ctx.reply((msg) => msg.text, { timeout: 1000000 });
    const filename = filenameMsg.text;
    const file = await findFile(folderPath, filename);
    if (file) {
      await sendFile(file, ctx);
    } else {
      ctx.reply(`Файл с именем "${filename}" не найден`);
    }
  } catch (error) {
    console.log(error);
    ctx.reply('Ошибка при поиске файла');
  }
};
module.exports = {
  findAndSendFile
};