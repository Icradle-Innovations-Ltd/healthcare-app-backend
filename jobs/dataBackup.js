const { Appointment } = require('../models/Appointment');
const { Patient } = require('../models/Patient');
const { Doctor } = require('../models/Doctor');const fs = require('fs');
const path = require('path');

class DataBackup {
    constructor() {
        this.backupPath = path.join(__dirname, '../backups');
    }

    async createBackup() {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupDir = path.join(this.backupPath, timestamp);

        // Create backup directory
        if (!fs.existsSync(this.backupPath)) {
            fs.mkdirSync(this.backupPath);
        }
        fs.mkdirSync(backupDir);

        // Backup each model's data
        const appointments = await Appointment.findAll();
        const patients = await Patient.findAll();
        const doctors = await Doctor.findAll();

        // Write to JSON files
        fs.writeFileSync(
            path.join(backupDir, 'appointments.json'),
            JSON.stringify(appointments, null, 2)
        );
        fs.writeFileSync(
            path.join(backupDir, 'patients.json'),
            JSON.stringify(patients, null, 2)
        );
        fs.writeFileSync(
            path.join(backupDir, 'doctors.json'),
            JSON.stringify(doctors, null, 2)
        );

        return {
            success: true,
            timestamp,
            location: backupDir
        };
    }

    async restoreBackup(backupTimestamp) {
        const backupDir = path.join(this.backupPath, backupTimestamp);
        
        const appointmentsData = JSON.parse(
            fs.readFileSync(path.join(backupDir, 'appointments.json'))
        );
        const patientsData = JSON.parse(
            fs.readFileSync(path.join(backupDir, 'patients.json'))
        );
        const doctorsData = JSON.parse(
            fs.readFileSync(path.join(backupDir, 'doctors.json'))
        );

        await Patient.bulkCreate(patientsData, { updateOnDuplicate: ['id'] });
        await Doctor.bulkCreate(doctorsData, { updateOnDuplicate: ['id'] });
        await Appointment.bulkCreate(appointmentsData, { updateOnDuplicate: ['id'] });

        return {
            success: true,
            timestamp: backupTimestamp
        };
    }
}

module.exports = new DataBackup();
