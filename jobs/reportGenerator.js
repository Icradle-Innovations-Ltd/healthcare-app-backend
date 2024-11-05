const { Appointment } = require('../models/Appointment');
const { Patient } = require('../models/Patient');
const { Doctor } = require('../models/Doctor');const { Op } = require('sequelize');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

class ReportGenerator {
    constructor() {
        this.reportsPath = path.join(__dirname, '../reports');
        if (!fs.existsSync(this.reportsPath)) {
            fs.mkdirSync(this.reportsPath);
        }
    }

    async generateDailyReport(date) {
        const startDate = new Date(date);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(date);
        endDate.setHours(23, 59, 59, 999);

        const appointments = await Appointment.findAll({
            where: {
                dateTime: {
                    [Op.between]: [startDate, endDate]
                }
            },
            include: ['patient', 'doctor']
        });

        const stats = {
            total: appointments.length,
            completed: appointments.filter(a => a.status === 'completed').length,
            cancelled: appointments.filter(a => a.status === 'cancelled').length,
            rescheduled: appointments.filter(a => a.status === 'rescheduled').length
        };

        const doc = new PDFDocument();
        const filename = `daily-report-${date}.pdf`;
        doc.pipe(fs.createWriteStream(path.join(this.reportsPath, filename)));

        // Generate PDF content
        doc.fontSize(20).text('Daily Appointments Report', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(`Date: ${date}`);
        doc.moveDown();
        doc.text(`Total Appointments: ${stats.total}`);
        doc.text(`Completed: ${stats.completed}`);
        doc.text(`Cancelled: ${stats.cancelled}`);
        doc.text(`Rescheduled: ${stats.rescheduled}`);
        doc.moveDown();

        // List appointments
        appointments.forEach(apt => {
            doc.text(`Time: ${apt.dateTime.toLocaleTimeString()}`);
            doc.text(`Patient: ${apt.patient.name}`);
            doc.text(`Doctor: Dr. ${apt.doctor.name}`);
            doc.text(`Status: ${apt.status}`);
            doc.moveDown();
        });

        doc.end();

        return {
            success: true,
            filename,
            stats
        };
    }

    async generateMonthlyReport(month, year) {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);

        const appointments = await Appointment.findAll({
            where: {
                dateTime: {
                    [Op.between]: [startDate, endDate]
                }
            },
            include: ['patient', 'doctor']
        });

        const doc = new PDFDocument();
        const filename = `monthly-report-${month}-${year}.pdf`;
        doc.pipe(fs.createWriteStream(path.join(this.reportsPath, filename)));

        // Generate monthly statistics and PDF
        const monthlyStats = {
            totalAppointments: appointments.length,
            byDoctor: {},
            byStatus: {
                completed: 0,
                cancelled: 0,
                rescheduled: 0,
                scheduled: 0
            }
        };

        appointments.forEach(apt => {
            monthlyStats.byStatus[apt.status]++;
            monthlyStats.byDoctor[apt.doctor.name] = 
                (monthlyStats.byDoctor[apt.doctor.name] || 0) + 1;
        });

        // Generate PDF content
        doc.fontSize(20).text('Monthly Appointments Report', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(`Month: ${month}/${year}`);
        doc.moveDown();
        
        Object.entries(monthlyStats.byStatus).forEach(([status, count]) => {
            doc.text(`${status}: ${count}`);
        });
        
        doc.moveDown();
        doc.text('Appointments by Doctor:');
        Object.entries(monthlyStats.byDoctor).forEach(([doctor, count]) => {
            doc.text(`Dr. ${doctor}: ${count}`);
        });

        doc.end();

        return {
            success: true,
            filename,
            stats: monthlyStats
        };
    }
}

module.exports = new ReportGenerator();
