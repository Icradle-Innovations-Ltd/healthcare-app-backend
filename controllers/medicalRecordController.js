const db = require('../config/db');

const medicalRecordController = {
  createRecord: (req, res) => {
    const { patientId, diagnosis, prescription, notes } = req.body;
    const doctorId = req.user.userId;
    
    const sql = `
      INSERT INTO medical_records (patientId, doctorId, diagnosis, prescription, notes)
      VALUES (?, ?, ?, ?, ?)
    `;

    db.run(sql, [patientId, doctorId, diagnosis, prescription, notes], function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to create medical record' });
      }
      res.status(201).json({ id: this.lastID, message: 'Medical record created successfully' });
    });
  },

  getPatientHistory: (req, res) => {
    const { patientId } = req.params;
    
    const sql = `
      SELECT mr.*, u.firstName as doctorFirstName, u.lastName as doctorLastName
      FROM medical_records mr
      JOIN users u ON mr.doctorId = u.id
      WHERE mr.patientId = ?
      ORDER BY mr.date DESC
    `;

    db.all(sql, [patientId], (err, records) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to fetch medical records' });
      }
      res.json(records);
    });
  }
};

module.exports = medicalRecordController;
