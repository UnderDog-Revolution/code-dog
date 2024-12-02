const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./events.db');

// 테이블 생성 (초기 1회 실행)
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        importance TEXT,
        name TEXT,
        datetime TEXT,
        roles TEXT
    )`);
});

module.exports = db;