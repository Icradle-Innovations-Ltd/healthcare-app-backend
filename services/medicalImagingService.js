const ImagingStudy = require('../models/ImagingStudy');
const ImagingResult = require('../models/ImagingResult');
const StorageService = require('./storageService');

class MedicalImagingService {
  static async scheduleImaging(studyData) {
    const study = await ImagingStudy.create({
      ...studyData,
      status: 'scheduled',
      scheduledDate: new Date(studyData.scheduledDate)
    });

    await this.reserveImagingEquipment(study);
    await this.notifyRadiology(study);

    return study;
  }

  static async uploadImagingResults(studyId, resultData) {
    const images = await Promise.all(
      resultData.images.map(image => 
        StorageService.uploadImage(image, 'imaging-results')
      )
    );

    const result = await ImagingResult.create({
      study: studyId,
      images,
      findings: resultData.findings,
      impression: resultData.impression,
      radiologist: resultData.radiologistId
    });

    await this.notifyOrderingProvider(result);
    return result;
  }

  static async getImagingHistory(patientId) {
    return await ImagingStudy.find({ patient: patientId })
      .populate('results')
      .sort({ scheduledDate: -1 });
  }
}

module.exports = MedicalImagingService;
