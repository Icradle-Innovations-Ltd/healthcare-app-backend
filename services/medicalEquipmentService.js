const Equipment = require('../models/Equipment');
const Maintenance = require('../models/Maintenance');
const Reservation = require('../models/Reservation');

class MedicalEquipmentService {
  static async trackEquipment(equipmentId) {
    const equipment = await Equipment.findById(equipmentId);
    return {
      status: equipment.status,
      location: await this.getEquipmentLocation(equipmentId),
      lastMaintenance: await this.getLastMaintenance(equipmentId),
      currentReservation: await this.getCurrentReservation(equipmentId)
    };
  }

  static async scheduleEquipment(reservationData) {
    const availability = await this.checkEquipmentAvailability(
      reservationData.equipmentId,
      reservationData.startTime,
      reservationData.endTime
    );

    if (availability.isAvailable) {
      return await Reservation.create(reservationData);
    }
    
    throw new Error('Equipment not available for requested time slot');
  }

  static async reportMaintenance(maintenanceData) {
    const maintenance = await Maintenance.create({
      ...maintenanceData,
      reportDate: new Date()
    });

    await Equipment.findByIdAndUpdate(
      maintenanceData.equipmentId,
      { status: 'maintenance' }
    );

    return maintenance;
  }
}

module.exports = MedicalEquipmentService;
