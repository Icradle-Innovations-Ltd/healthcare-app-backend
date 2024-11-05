const db = require('../config/db');

class Doctor {
    static createTable() {
        const sql = `
            CREATE TABLE IF NOT EXISTS doctors (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                userId INTEGER NOT NULL,
                specialization TEXT NOT NULL,
                license TEXT UNIQUE NOT NULL,
                experience INTEGER,
                availability TEXT,
                FOREIGN KEY (userId) REFERENCES users(id)
            )
        `;
        return db.run(sql);
    }

    static create(doctor) {
        const sql = `
            INSERT INTO doctors (userId, specialization, license, experience, availability)
            VALUES (?, ?, ?, ?, ?)
        `;
        return db.run(sql, [
            doctor.userId,
            doctor.specialization,
            doctor.license,
            doctor.experience,
            doctor.availability
        ]);
    }
}

module.exports = Doctor;
