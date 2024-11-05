const nodemailer = require('nodemailer');
const ejs = require('ejs');
const path = require('path');

class NotificationService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  async sendEmail(options) {
    const template = await ejs.renderFile(
      path.join(__dirname, `../views/emails/${options.template}.ejs`),
      options.data
    );

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: options.to,
      subject: options.subject,
      html: template
    };

    await this.transporter.sendMail(mailOptions);
  }

  async sendAppointmentReminder(appointment) {
    await this.sendEmail({
      to: appointment.patient.email,
      subject: 'Appointment Reminder',
      template: 'appointmentReminder',
      data: {
        patientName: appointment.patient.profile.firstName,
        doctorName: appointment.provider.profile.firstName,
        date: appointment.dateTime,
        facility: appointment.facility.name
      }
    });
  }
}

module.exports = new NotificationService();
