const { Telegraf } = require('telegraf');
const bot = new Telegraf(process.env.BOT_TOKEN);

const fs = require('fs');
require('dotenv').config();
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./mydb.sqlite');
const folderPath = process.env.FOLDER_PATH;
const path = require('path');
const { logChanges } = require('./logging');

async function updateStats() {
  const dirPath = process.env.FOLDER_PATH;
  const files = await fs.promises.readdir(dirPath);

  const stats = {
    totalFileSize: 0,
    fileTypeCounts: {
      text: 0,
      image: 0,
      pdf: 0,
      document: 0,
      other: 0,
      // Дополнительные типы файлов
      video: 0,
      audio: 0,
      executable: 0,
      script: 0,
      shortcut: 0,
      spreadsheet: 0,
      data: 0,
      archive: 0,
      diskImage: 0,
      package: 0,
      library: 0,
      font: 0,
    },
  };

  for await (const file of files) {
    const fileType = getFileType(file);
    stats.totalFileSize += (await fs.promises.stat(dirPath + "/" + file)).size;

    if (!stats.fileTypeCounts[fileType]) {
      stats.fileTypeCounts[fileType] = 0;
    }

    stats.fileTypeCounts[fileType] += 1;
  }

  console.log(stats);
  return stats; // возвращаем объект stats
}

function getFileType(fileName) {
  const supportedFileTypes = {
    doc: 'document',
    docx: 'document',
    ppt: 'document',
    pptx: 'document',
    pdf: 'pdf',
    txt: 'text',
    jpg: 'image',
    jpeg: 'image',
    png: 'image',
    gif: 'image',
    mp4: 'video',
    mp3: 'audio',
    exe: 'executable',
    bat: 'executable',
    py: 'script',
    js: 'script',
    lnk: 'shortcut',
    csv: 'spreadsheet',
    xls: 'spreadsheet',
    xlsx: 'spreadsheet',
    xml: 'data',
    json: 'data',
    zip: 'archive',
    rar: 'archive',
    iso: 'disk image',
    dmg: 'disk image',
    deb: 'package',
    rpm: 'package',
    apk: 'package',
    dll: 'library',
    otf: 'font',
    ttf: 'font',
    // Дополнительные типы файлов
    bmp: 'image',
    svg: 'image',
    avi: 'video',
    mov: 'video',
    wmv: 'video',
    flv: 'video',
    wav: 'audio',
    ogg: 'audio',
    aac: 'audio',
  };

  const fileTypeMatch = fileName.match(/\.([^.]+)$/);

  if (!fileTypeMatch) {
    return 'other';
  }

  const fileType = fileTypeMatch[1].toLowerCase();
  return supportedFileTypes[fileType] || 'other';
}

function scanFolder(folderPath) {
  let totalFileSize = 0;
  let fileTypeCounts = {
    text: 0,
    image: 0,
    pdf: 0,
    document: 0,
    other: 0,
    // Дополнительные типы файлов
    video: 0,
    audio: 0,
    executable: 0,
    script: 0,
    shortcut: 0,
    spreadsheet: 0,
    data: 0,
    archive: 0,
    diskImage: 0,
    package: 0,
    library: 0,
    font: 0,
  };
  let fileCount = 0;
  let folderCount = 0;

  const scanDirectory = (directoryPath) => {
    const files = fs.readdirSync(directoryPath);
    files.forEach((file) => {
      const filePath = path.join(directoryPath, file);
      const stats = fs.statSync(filePath);
      if (stats.isDirectory()) {
        folderCount++;
        scanDirectory(filePath);
      }
      if (stats.isFile()) {
        fileCount++;
        totalFileSize += stats.size;
        const fileType = getFileType(filePath);
        fileTypeCounts[fileType]++;
      }
    });
  };

  scanDirectory(folderPath);

  return {
    fileCount,
    folderCount,
    totalFileSize,
    fileTypeCounts,
  };
}

function updateLocalDB(stats) {
  db.serialize(() => {
    const {
      fileCount,
      folderCount,
      totalFileSize,
      fileTypeCounts,
    } = stats;

    db.run(
      `INSERT INTO folder_stats (date, file_count, folder_count, total_file_size, text_count, image_count, pdf_count, document_count, other_count, video_count, audio_count, executable_count, script_count, shortcut_count, spreadsheet_count, data_count, archive_count, disk_image_count, package_count, library_count, font_count)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      new Date().toISOString(),
      fileCount,
      folderCount,
      totalFileSize,
      fileTypeCounts.text,
      fileTypeCounts.image,
      fileTypeCounts.pdf,
      fileTypeCounts.document,
      fileTypeCounts.other,
      fileTypeCounts.video,
      fileTypeCounts.audio,
      fileTypeCounts.executable,
      fileTypeCounts.script,
      fileTypeCounts.shortcut,
      fileTypeCounts.spreadsheet,
      fileTypeCounts.data,
      fileTypeCounts.archive,
      fileTypeCounts.diskImage,
      fileTypeCounts.package,
      fileTypeCounts.library,
      fileTypeCounts.font,
      (err) => {
        if (err) {
          console.error(err.message);
        } else {
          console.log('Статистика успешно добавлена в базу данных!');
          logChanges('Статистика добавлена в БД');
        }
      }
    );
  });
}

function postStatistics(ctx) {
  db.serialize(() => {
    const query =
      'SELECT * FROM (SELECT date, file_count, folder_count, total_file_size, text_count, image_count, pdf_count, document_count, other_count, video_count, audio_count, executable_count, script_count, shortcut_count, spreadsheet_count, data_count, archive_count, disk_image_count, package_count, library_count, font_count FROM folder_stats ORDER BY date DESC LIMIT 1) ORDER BY date ASC';

    db.all(query, (err, rows) => {
      if (err) {
        ctx.reply('Произошла ошибка при попытке получить статистику');
        logChanges('Произошла ошибка при попытке получить статистику');
        console.error(err.message);
      } else {
        let response = 'Последняя информация о папке:\n\n';
        rows.forEach((row) => {
          response += `Дата: ${row.date}
          Файлов: ${row.file_count}
          Папок: ${row.folder_count}
          Размер: ${(row.total_file_size / 1024 / 1024).toFixed(2)} MB
          Текстовых: ${row.text_count}
          Изображений: ${row.image_count}
          Документов: ${row.document_count}
          PDF: ${row.pdf_count}
          Других: ${row.other_count}
          Видео: ${row.video_count}
          Аудио: ${row.audio_count}
          Исполняемых: ${row.executable_count}
          Скриптов: ${row.script_count}
          Ссылок: ${row.shortcut_count}
          Таблиц: ${row.spreadsheet_count}
          Данных: ${row.data_count}
          Архивов: ${row.archive_count}
          Образов дисков: ${row.disk_image_count}
          Пакетов: ${row.package_count}
          Библиотек: ${row.library_count}
          Шрифтов: ${row.font_count}\n\n`;
        });
        ctx.reply(response);
        logChanges('Запрошена статистика у stats.js');
        console.log(ctx);
      }
    });
  });
}

setInterval(() => {
  const stats = scanFolder(folderPath);
  updateLocalDB(stats);
}, 1000 * 60 * 30);
logChanges('Обновление информации о папке');

module.exports = {
  postStatistics,
  getFileType,
  updateStats,
};
