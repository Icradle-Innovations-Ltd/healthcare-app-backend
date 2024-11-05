const VideoSession = require('../models/VideoSession');
const Appointment = require('../models/Appointment');
const NotificationService = require('./notificationService');

class TelemedicineService {
  static async createVideoSession(appointmentId) {
    const appointment = await Appointment.findById(appointmentId)
      .populate('patient provider');

    const session = await VideoSession.create({
      appointment: appointmentId,
      patient: appointment.patient._id,
      provider: appointment.provider._id,
      status: 'scheduled',
      sessionToken: this.generateSessionToken()
    });

    await NotificationService.sendVideoSessionInvites(session);
    return session;
  }

  static async startSession(sessionId) {
    const session = await VideoSession.findById(sessionId);
    session.status = 'active';
    session.startTime = new Date();
    await session.save();

    const roomDetails = await this.initializeVideoRoom(session);
    return {
      session,
      connectionDetails: roomDetails
    };
  }

  static async endSession(sessionId, summary) {
    const session = await VideoSession.findById(sessionId);
    session.status = 'completed';
    session.endTime = new Date();
    session.summary = summary;
    await session.save();

    await this.generateSessionReport(session);
    return session;
  }
}

module.exports = TelemedicineService;
