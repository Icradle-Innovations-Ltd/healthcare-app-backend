const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');
const HealthRecord = require('../models/HealthRecord');
const Appointment = require('../models/Appointment');

class ReportService {
  static async generateHealthReport(patientId) {
    const records = await HealthRecord.find({ patient: patientId })
      .populate('provider')
      .sort({ date: -1 });

    const doc = new PDFDocument();
    this.addHealthReportContent(doc, records);
    return doc;
  }

  static async generateAppointmentReport(filters) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Appointments');

    const appointments = await Appointment.find(filters)
      .populate('patient provider');

    this.addAppointmentReportContent(worksheet, appointments);
    return workbook;
  }

  static async generateAnalyticsReport(startDate, endDate) {
    const metrics = await Promise.all([
      this.getAppointmentMetrics(startDate, endDate),
      this.getProviderMetrics(startDate, endDate),
      this.getPatientMetrics(startDate, endDate)
    ]);

    const workbook = new ExcelJS.Workbook();
    this.addAnalyticsReportContent(workbook, metrics);
    return workbook;
  }
}

module.exports = ReportService;
