const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database("./collection.db", sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
    if(err){
        return console.error(err.message);
    }
    console.log('connected to DB');
});

db.run(
    `CREATE TABLE IF NOT EXISTS actions (
        id TEXT PRIMARY KEY,
        img TEXT,
        action TEXT,
        account TEXT
    )`,
    (err) => {
        if(err){
            return console.error(err.message);
        }
        console.log('Actions Table created');
    }
);