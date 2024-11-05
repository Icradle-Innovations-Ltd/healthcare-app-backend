const Appointment = require('../models/Appointment');
const NotificationService = require('./notificationService');

class AppointmentService {
  static async scheduleAppointment(appointmentData) {
    const appointment = await Appointment.create(appointmentData);
    
    await NotificationService.sendAppointmentReminder(appointment);
    
    return appointment;
  }

  static async rescheduleAppointment(appointmentId, newDateTime) {
    const appointment = await Appointment.findByIdAndUpdate(
      appointmentId,
      { 
        dateTime: newDateTime,
        status: 'rescheduled'
      },
      { new: true }
    );

    await NotificationService.sendAppointmentReminder(appointment);
    
    return appointment;
  }

  static async cancelAppointment(appointmentId, cancelReason) {
    return await Appointment.findByIdAndUpdate(
      appointmentId,
      {
        status: 'cancelled',
        cancelReason,
        cancelledAt: new Date()
      },
      { new: true }
    );
  }

  static async getAvailableSlots(providerId, date) {
    // Implementation for checking available appointment slots
    const bookedSlots = await Appointment.find({
      provider: providerId,
      dateTime: {
        $gte: new Date(date),
        $lt: new Date(new Date(date).setDate(new Date(date).getDate() + 1))
      }
    }).select('dateTime');

    // Generate available slots based on provider's schedule
    // and remove booked slots
    return this.generateAvailableSlots(providerId, date, bookedSlots);
  }
}

module.exports = AppointmentService;
