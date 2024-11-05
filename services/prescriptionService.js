const HealthRecord = require('../models/HealthRecord');
const DrugInteraction = require('../models/DrugInteraction');
const NotificationService = require('./notificationService');

class PrescriptionService {
  static async createPrescription(prescriptionData) {
    const interactions = await this.checkDrugInteractions(
      prescriptionData.medications,
      prescriptionData.patientId
    );

    if (interactions.length > 0) {
      await NotificationService.alertDrugInteraction(
        prescriptionData.providerId,
        interactions
      );
    }

    const prescription = await HealthRecord.create({
      type: 'prescription',
      ...prescriptionData
    });

    await this.scheduleMedicationReminders(prescription);
    return prescription;
  }

  static async renewPrescription(prescriptionId) {
    const oldPrescription = await HealthRecord.findById(prescriptionId);
    const newPrescription = await HealthRecord.create({
      ...oldPrescription.toObject(),
      _id: undefined,
      date: new Date(),
      status: 'active'
    });

    return newPrescription;
  }

  static async getMedicationHistory(patientId) {
    return await HealthRecord.find({
      patient: patientId,
      type: 'prescription'
    }).sort({ date: -1 });
  }
}

module.exports = PrescriptionService;
