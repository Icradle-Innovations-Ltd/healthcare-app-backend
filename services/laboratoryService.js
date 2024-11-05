const LabTest = require('../models/LabTest');
const LabResult = require('../models/LabResult');
const HealthRecord = require('../models/HealthRecord');

class LaboratoryService {
  static async orderLabTest(testData) {
    const labTest = await LabTest.create({
      ...testData,
      status: 'pending',
      orderDate: new Date()
    });

    await this.scheduleLabTest(labTest);
    await this.notifyLaboratory(labTest);

    return labTest;
  }

  static async uploadResults(testId, resultData) {
    const result = await LabResult.create({
      test: testId,
      ...resultData,
      uploadDate: new Date()
    });

    await HealthRecord.create({
      type: 'lab-result',
      patient: result.test.patient,
      provider: result.test.provider,
      data: result
    });

    return result;
  }

  static async getPatientLabHistory(patientId) {
    return await LabTest.find({ patient: patientId })
      .populate('results')
      .sort({ orderDate: -1 });
  }
}

module.exports = LaboratoryService;
