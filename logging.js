const fs = require('fs');
const path = require('path');

const logFolder = path.join(__dirname, 'logs');
if (!fs.existsSync(logFolder)) {
  fs.mkdirSync(logFolder);
}

const logFile = path.join(logFolder, 'log.txt');

function logChanges(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;

  fs.appendFile(logFile, logMessage, (err) => {
    if (err) {
      logChanges('Ошибка записи лог файла');
      console.error('Failed to write to log file:', err);
    }
  });
}

module.exports = { logChanges };