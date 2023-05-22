const fs = require('fs');
const path = require('path');

const logFolder = path.join(__dirname, 'logs');
if (!fs.existsSync(logFolder)) {
  fs.mkdirSync(logFolder);
}

function getCurrentLogFile() {
  const currentDate = new Date().toISOString().split('T')[0];
  return path.join(logFolder, `${currentDate}.txt`);
}

function logChanges(message) {
  const logFile = getCurrentLogFile();
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;

  fs.appendFile(logFile, logMessage, (err) => {
    if (err) {
      logChanges('Ошибка записи лог файла');
      console.error('Failed to write to log file:', err);
    }
  });
}

function getLastLogLines(numLines) {
  const logFile = getCurrentLogFile();
  const logContent = fs.readFileSync(logFile, 'utf8');
  const logLines = logContent.split('\n').filter((line) => line.trim() !== '');
  const startIndex = Math.max(logLines.length - numLines, 0);
  return logLines.slice(startIndex);
}

function sendLastLogFile(ctx) {
  const logFile = getCurrentLogFile();
  ctx.replyWithDocument({ source: logFile });
}

module.exports = { logChanges, getLastLogLines, sendLastLogFile };