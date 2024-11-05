const db = require('../config/db');

class MedicalRecord {
    static createTable() {
        const sql = `
            CREATE TABLE IF NOT EXISTS medical_records (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                patientId INTEGER NOT NULL,
                doctorId INTEGER NOT NULL,
                diagnosis TEXT,
                prescription TEXT,
                notes TEXT,
                date DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (patientId) REFERENCES patients(id),
                FOREIGN KEY (doctorId) REFERENCES doctors(id)
            )
        `;
        return db.run(sql);
    }

    static create(record) {
        const sql = `
            INSERT INTO medical_records (patientId, doctorId, diagnosis, prescription, notes)
            VALUES (?, ?, ?, ?, ?)
        `;
        return db.run(sql, [
            record.patientId,
            record.doctorId,
            record.diagnosis,
            record.prescription,
            record.notes
        ]);
    }
}

module.exports = MedicalRecord;
