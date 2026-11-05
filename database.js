import Database from 'better-sqlite3';

const db = new Database('database.sqlite');

// mod logs table
db.exec(`
    CREATE TABLE IF NOT EXISTS mod_logs (
                                            id INTEGER PRIMARY KEY AUTOINCREMENT,
                                            guild_id TEXT NOT NULL,
                                            user_id TEXT NOT NULL,
                                            moderator_id TEXT NOT NULL,
                                            action TEXT NOT NULL,
                                            reason TEXT,
                                            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`);

// custom embed table
db.exec(`
    CREATE TABLE IF NOT EXISTS custom_embeds (
                                                 guild_id TEXT,
                                                 name TEXT,
                                                 title TEXT,
                                                 description TEXT,
                                                 color INTEGER,
                                                 author TEXT,
                                                 PRIMARY KEY (guild_id, name)
        )
`);

// user levels table
db.exec(`
    CREATE TABLE IF NOT EXISTS user_levels (
                                               guild_id TEXT,
                                               user_id TEXT,
                                               xp INTEGER DEFAULT 0,
                                               level INTEGER DEFAULT 0,
                                               PRIMARY KEY (guild_id, user_id)
        )
`);

export default db;