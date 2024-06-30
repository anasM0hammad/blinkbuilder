import sqlite3 from "sqlite3";
import { open, Database } from 'sqlite'

let db: any = null;

export const getAction = async (id: string) => {
    if(!db){
        db = await open({
            filename: './collection.db',
            driver: sqlite3.Database,
        });
    }
    console.log(db);
    const item = await db.get(`SELECT action FROM actions WHERE id=?`, id);
    return item;
}

export const getAccount = async (id: string) => {
    if(!db){
        db = await open({
            filename: './collection.db',
            driver: sqlite3.Database,
        });
    }

    const item = await db.get(`SELECT account FROM actions WHERE id=?`, id);
    return item;
}

export const putData = async (id: string, data: string, account: string) => {
    const sql = `INSERT INTO actions (id, img, action, account) VALUES (?, ?, ?, ?)`;
    console.log(sql);
    if(!db){
        db = await open({
            filename: './collection.db',
            driver: sqlite3.Database,
        });
    }

    db.run(sql, [id, '', data, account], (err: any) => {
        if(err) console.error(err.message);
    });
}
