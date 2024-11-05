const db = require('../config/db');

class Patient {
    static createTable() {
        const sql = `
            CREATE TABLE IF NOT EXISTS patients (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                userId INTEGER NOT NULL,
                dateOfBirth DATE NOT NULL,
                bloodGroup TEXT,
                allergies TEXT,
                medicalHistory TEXT,
                emergencyContact TEXT,
                FOREIGN KEY (userId) REFERENCES users(id)
            )
        `;
        return db.run(sql);
    }

    static create(patient) {
        const sql = `
            INSERT INTO patients (userId, dateOfBirth, bloodGroup, allergies, medicalHistory, emergencyContact)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        return db.run(sql, [
            patient.userId,
            patient.dateOfBirth,
            patient.bloodGroup,
            patient.allergies,
            patient.medicalHistory,
            patient.emergencyContact
        ]);
    }
}

module.exports = Patient;
