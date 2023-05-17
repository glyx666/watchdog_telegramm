const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./mydb.sqlite');

// Очистка таблицы
db.serialize(() => {
  db.run('DROP TABLE IF EXISTS folder_stats');
});

// Создание новой таблицы
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS folder_stats (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT,
      file_count INTEGER,
      folder_count INTEGER,
      total_file_size INTEGER,
      text_count INTEGER,
      image_count INTEGER,
      pdf_count INTEGER,
      document_count INTEGER,
      other_count INTEGER,
      video_count INTEGER,
      audio_count INTEGER,
      executable_count INTEGER,
      script_count INTEGER,
      shortcut_count INTEGER,
      spreadsheet_count INTEGER,
      data_count INTEGER,
      archive_count INTEGER,
      disk_image_count INTEGER,
      package_count INTEGER,
      library_count INTEGER,
      font_count INTEGER
    )
  `);
});

// Закрытие соединения с базой данных
db.close();