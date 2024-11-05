const DoctorService = require('../services/doctorService');
const { catchAsync } = require('../utils/errorHandler');

const doctorController = {
    getPatients: catchAsync(async (req, res) => {
        const patients = await DoctorService.getPatients(req.user.id);
        res.json({
            status: 'success',
            data: { patients }
        });
    }),

    getAppointments: catchAsync(async (req, res) => {
        const appointments = await DoctorService.getAppointments(req.user.id);
        res.json({
            status: 'success',
            data: { appointments }
        });
    }),

    updateHealthRecord: catchAsync(async (req, res) => {
        const record = await DoctorService.updateHealthRecord(req.params.recordId, req.body);
        res.json({
            status: 'success',
            data: { record }
        });
    }),

    createPrescription: catchAsync(async (req, res) => {
        const prescription = await DoctorService.createPrescription(req.params.patientId, req.body);
        res.json({
            status: 'success',
            data: { prescription }
        });
    }),

    getSchedule: catchAsync(async (req, res) => {
        const schedule = await DoctorService.getSchedule(req.user.id);
        res.json({
            status: 'success',
            data: { schedule }
        });
    })
};

module.exports = doctorController;
