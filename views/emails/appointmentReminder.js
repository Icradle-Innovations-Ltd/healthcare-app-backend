const { Appointment } = require('../../models');
const { Op } = require('sequelize');
const nodemailer = require('nodemailer');
const twilio = require('twilio');
const cron = require('node-cron');

class AppointmentReminder {
    constructor() {
        // Email configuration
        this.emailTransporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });

        // SMS configuration
        this.smsClient = twilio(
            process.env.TWILIO_ACCOUNT_SID,
            process.env.TWILIO_AUTH_TOKEN
        );
    }

    async getUpcomingAppointments() {
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);

        return await Appointment.findAll({
            where: {
                dateTime: {
                    [Op.between]: [now, tomorrow]
                },
                status: 'scheduled'
            },
            include: ['patient', 'doctor']
        });
    }

    async sendEmailReminder(appointment) {
        const emailContent = {
            from: process.env.SMTP_FROM,
            to: appointment.patient.email,
            subject: 'Your Upcoming Appointment Reminder',
            html: `
                <h2>Appointment Reminder</h2>
                <p>Hello ${appointment.patient.name},</p>
                <p>This is a reminder for your upcoming appointment:</p>
                <ul>
                    <li>Date: ${appointment.dateTime.toLocaleDateString()}</li>
                    <li>Time: ${appointment.dateTime.toLocaleTimeString()}</li>
                    <li>Doctor: Dr. ${appointment.doctor.name}</li>
                    <li>Duration: ${appointment.duration} minutes</li>
                </ul>
                <p>Location: Medical Center</p>
                <p>Please arrive 10 minutes before your scheduled time.</p>
            `
        };

        return await this.emailTransporter.sendMail(emailContent);
    }

    async sendSMSReminder(appointment) {
        const message = `
            Reminder: Your appointment with Dr. ${appointment.doctor.name}
            is scheduled for ${appointment.dateTime.toLocaleString()}.
            Please arrive 10 minutes early.
        `;

        return await this.smsClient.messages.create({
            body: message,
            to: appointment.patient.phone,
            from: process.env.TWILIO_PHONE_NUMBER
        });
    }

    async processReminders() {
        try {
            const appointments = await this.getUpcomingAppointments();
            const results = {
                total: appointments.length,
                emailsSent: 0,
                smsSent: 0,
                errors: []
            };

            for (const appointment of appointments) {
                try {
                    await this.sendEmailReminder(appointment);
                    results.emailsSent++;

                    await this.sendSMSReminder(appointment);
                    results.smsSent++;
                } catch (error) {
                    results.errors.push({
                        appointmentId: appointment.id,
                        error: error.message
                    });
                }
            }

            return results;
        } catch (error) {
            console.error('Reminder processing error:', error);
            throw error;
        }
    }

    startScheduledReminders() {
        // Run reminders every day at 9 AM
        cron.schedule('0 9 * * *', async () => {
            console.log('Running scheduled appointment reminders...');
            try {
                const results = await this.processReminders();
                console.log('Reminder results:', results);
            } catch (error) {
                console.error('Failed to process reminders:', error);
            }
        });

        // Run reminders 2 hours before each appointment
        cron.schedule('*/30 * * * *', async () => {
            const twoHoursFromNow = new Date();
            twoHoursFromNow.setHours(twoHoursFromNow.getHours() + 2);
            
            const urgentAppointments = await Appointment.findAll({
                where: {
                    dateTime: {
                        [Op.between]: [new Date(), twoHoursFromNow]
                    },
                    status: 'scheduled'
                },
                include: ['patient', 'doctor']
            });

            for (const appointment of urgentAppointments) {
                await this.sendSMSReminder(appointment);
            }
        });
    }
}

module.exports = new AppointmentReminder();
