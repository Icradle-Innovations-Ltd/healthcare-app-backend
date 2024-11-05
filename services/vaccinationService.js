const VaccinationRecord = require('../models/VaccinationRecord');
const VaccineInventory = require('../models/VaccineInventory');
const HealthRecord = require('../models/HealthRecord');

class VaccinationService {
  static async scheduleVaccination(vaccinationData) {
    const availability = await VaccineInventory.findOne({
      vaccine: vaccinationData.vaccineId,
      quantity: { $gt: 0 }
    });

    if (!availability) {
      throw new Error('Vaccine not available');
    }

    const vaccination = await VaccinationRecord.create({
      ...vaccinationData,
      status: 'scheduled',
      scheduledDate: new Date(vaccinationData.scheduledDate)
    });

    return vaccination;
  }

  static async recordVaccination(recordData) {
    const record = await VaccinationRecord.create({
      ...recordData,
      administeredDate: new Date()
    });

    await HealthRecord.create({
      type: 'vaccination',
      patient: record.patient,
      provider: record.provider,
      data: record
    });

    await VaccineInventory.findOneAndUpdate(
      { vaccine: record.vaccine },
      { $inc: { quantity: -1 } }
    );

    return record;
  }

  static async getVaccinationSchedule(patientId) {
    const records = await VaccinationRecord.find({ patient: patientId });
    const recommendations = await this.generateVaccineRecommendations(patientId);
    
    return {
      records,
      recommendations,
      nextDue: this.calculateNextDueVaccines(records, recommendations)
    };
  }
}

module.exports = VaccinationService;
