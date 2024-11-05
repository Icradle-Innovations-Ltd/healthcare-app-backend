const { Appointment } = require('../models');
const { Op } = require('sequelize');
const nodemailer = require('nodemailer');
const twilio = require('twilio');
const cron = require('node-cron');  // Add this line at the top
class AppointmentReminder {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  async checkUpcomingAppointments() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const upcomingAppointments = await Appointment.findAll({
      where: {
        dateTime: {
          [Op.between]: [new Date(), tomorrow]
        },
        status: 'scheduled'
      },
      include: ['patient', 'doctor']
    });

    return upcomingAppointments;
  }

  async sendReminder(appointment) {
    const emailContent = {
      from: process.env.SMTP_FROM,
      to: appointment.patient.email,
      subject: 'Appointment Reminder',
      html: `
        <h2>Appointment Reminder</h2>
        <p>Dear ${appointment.patient.name},</p>
        <p>This is a reminder for your upcoming appointment:</p>
        <ul>
          <li>Date: ${appointment.dateTime.toLocaleDateString()}</li>
          <li>Time: ${appointment.dateTime.toLocaleTimeString()}</li>
          <li>Doctor: Dr. ${appointment.doctor.name}</li>
          <li>Duration: ${appointment.duration} minutes</li>
        </ul>
        <p>Reason: ${appointment.reason}</p>
        <p>Please arrive 10 minutes before your scheduled time.</p>
      `
    };

    return this.transporter.sendMail(emailContent);
  }

  async processReminders() {
    try {
      const appointments = await this.checkUpcomingAppointments();
      
      for (const appointment of appointments) {
        await this.sendReminder(appointment);
      }

      return {
        success: true,
        processedCount: appointments.length
      };
    } catch (error) {
      console.error('Reminder processing error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Method to start scheduled reminders
  startScheduledReminders() {
    // Run every day at 9:00 AM
    const schedule = '0 9 * * *';
    
    cron.schedule(schedule, async () => {
      await this.processReminders();
    });
  }
}

module.exports = new AppointmentReminder();
