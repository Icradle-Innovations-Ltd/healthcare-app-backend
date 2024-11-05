const MentalHealthAssessment = require('../models/MentalHealthAssessment');
const TherapySession = require('../models/TherapySession');
const Treatment = require('../models/Treatment');

class MentalHealthService {
  static async createAssessment(assessmentData) {
    const assessment = await MentalHealthAssessment.create({
      ...assessmentData,
      date: new Date(),
      status: 'completed'
    });

    const treatmentPlan = await this.generateTreatmentPlan(assessment);
    await this.scheduleFollowUp(assessment);

    return {
      assessment,
      treatmentPlan
    };
  }

  static async recordTherapySession(sessionData) {
    const session = await TherapySession.create({
      ...sessionData,
      date: new Date()
    });

    await Treatment.findByIdAndUpdate(
      sessionData.treatmentId,
      { 
        $push: { sessions: session._id },
        $set: { lastSessionDate: new Date() }
      }
    );

    return session;
  }

  static async trackProgress(patientId) {
    const assessments = await MentalHealthAssessment.find({ patient: patientId });
    const sessions = await TherapySession.find({ patient: patientId });
    
    return {
      assessments,
      sessions,
      progressMetrics: this.calculateProgressMetrics(assessments, sessions),
      recommendations: await this.generateRecommendations(patientId)
    };
  }
}

module.exports = MentalHealthService;
