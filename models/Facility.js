const db = require('../config/db');

class Facility {
    static createTable() {
        const sql = `
            CREATE TABLE IF NOT EXISTS facilities (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                address TEXT NOT NULL,
                city TEXT NOT NULL,
                state TEXT NOT NULL,
                zipCode TEXT NOT NULL,
                phone TEXT NOT NULL,
                email TEXT,
                website TEXT,
                services TEXT NOT NULL,
                operatingHours TEXT NOT NULL,
                emergencyServices BOOLEAN DEFAULT 0,
                capacity INTEGER,
                status TEXT DEFAULT 'active',
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `;
        return db.run(sql);
    }

    static create(facility) {
        const sql = `
            INSERT INTO facilities (
                name, address, city, state, zipCode, 
                phone, email, website, services, 
                operatingHours, emergencyServices, capacity
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        return db.run(sql, [
            facility.name,
            facility.address,
            facility.city,
            facility.state,
            facility.zipCode,
            facility.phone,
            facility.email,
            facility.website,
            JSON.stringify(facility.services),
            JSON.stringify(facility.operatingHours),
            facility.emergencyServices,
            facility.capacity
        ]);
    }

    static findById(id) {
        const sql = 'SELECT * FROM facilities WHERE id = ?';
        return db.get(sql, [id]);
    }

    static findAll() {
        const sql = 'SELECT * FROM facilities WHERE status = "active"';
        return db.all(sql);
    }

    static update(id, facility) {
        const sql = `
            UPDATE facilities 
            SET name = ?, address = ?, city = ?, state = ?, 
                zipCode = ?, phone = ?, email = ?, website = ?, 
                services = ?, operatingHours = ?, emergencyServices = ?, 
                capacity = ?, updatedAt = CURRENT_TIMESTAMP
            WHERE id = ?
        `;
        return db.run(sql, [
            facility.name,
            facility.address,
            facility.city,
            facility.state,
            facility.zipCode,
            facility.phone,
            facility.email,
            facility.website,
            JSON.stringify(facility.services),
            JSON.stringify(facility.operatingHours),
            facility.emergencyServices,
            facility.capacity,
            id
        ]);
    }

    static delete(id) {
        const sql = `
            UPDATE facilities 
            SET status = 'inactive', 
                updatedAt = CURRENT_TIMESTAMP 
            WHERE id = ?
        `;
        return db.run(sql, [id]);
    }

    static findByService(service) {
        const sql = `
            SELECT * FROM facilities 
            WHERE status = 'active' 
            AND services LIKE ?
        `;
        return db.all(sql, [`%${service}%`]);
    }
}

module.exports = Facility;