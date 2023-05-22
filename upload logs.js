const fs = require('fs');
const { Client } = require('@microsoft/microsoft-graph-client');
const { Stream } = require('stream');

const clientId = 'YOUR_CLIENT_ID';
const clientSecret = 'YOUR_CLIENT_SECRET';
const refreshToken = 'YOUR_REFRESH_TOKEN';

const logFile = getCurrentLogFile();
const logFileStream = fs.createReadStream(logFile);

const client = Client.init({
  authProvider: (done) => {
    done(null, {
      accessToken: 'YOUR_ACCESS_TOKEN',
      expiresOnTimestamp: Date.now() + 3600000, // Expires in 1 hour
    });
  },
});

async function uploadLogFileToOneDrive() {
  const uploadStream = new Stream.PassThrough();
  logFileStream.pipe(uploadStream);

  const uploadResponse = await client
    .api('/me/drive/root:/logs/' + path.basename(logFile) + ':/content')
    .putStream(uploadStream);

  console.log('File uploaded to OneDrive:', uploadResponse);
}

// Вызов функции выгрузки файла на OneDrive
uploadLogFileToOneDrive();
