// statistics.js
const { toggleMonitoring, toggleNotifications } = require('./bot');

let totalNotifications = 0;
let totalFilesProcessed = 0;
let startTime = 0;
let totalAddOperations = 0;
let totalChangeOperations = 0;

let endTime = 0;

function incrementNotifications(operation) {
  totalNotifications++;
  if (operation === 'add') {
    totalAddOperations++;
  } else if (operation === 'change') {
    totalChangeOperations++;
  }
}


function incrementFilesProcessed() {
  totalFilesProcessed++;
}

function startExecutionTimer() {
  startTime = Date.now();
}

function stopExecutionTimer() {
  endTime = Date.now();
}

function getExecutionTime() {
  const duration = endTime - startTime;
  const hours = Math.floor(duration / 3600000);
  const minutes = Math.floor((duration % 3600000) / 60000);
  const seconds = Math.floor((duration % 60000) / 1000);
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function getStatistics() {
  return {
    notifications: totalNotifications,
    filesProcessed: totalFilesProcessed,
    addOperations: totalAddOperations,
    changeOperations: totalChangeOperations,
    executionTime: getExecutionTime()
  };
}


module.exports = {
  incrementNotifications,
  incrementFilesProcessed,
  startExecutionTimer,
  stopExecutionTimer,
  getStatistics
};