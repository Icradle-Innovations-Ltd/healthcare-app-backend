const Prescription = require('../models/Prescription');
const Medication = require('../models/Medication');
const DrugInventory = require('../models/DrugInventory');

class PharmacyService {
  static async processPrescription(prescriptionId) {
    const prescription = await Prescription.findById(prescriptionId)
      .populate('medications');

    const inventory = await this.checkMedicationInventory(prescription.medications);
    const pricing = await this.calculateMedicationCosts(prescription);
    
    return {
      prescription,
      inventory,
      pricing,
      readyForPickup: inventory.allAvailable
    };
  }

  static async dispenseMedication(prescriptionId) {
    const prescription = await Prescription.findById(prescriptionId);
    
    await DrugInventory.updateMany(
      { medication: { $in: prescription.medications } },
      { $inc: { quantity: -1 } }
    );

    prescription.status = 'dispensed';
    prescription.dispensedDate = new Date();
    await prescription.save();

    return prescription;
  }

  static async checkInteractions(medications) {
    const interactions = [];
    for (let i = 0; i < medications.length; i++) {
      for (let j = i + 1; j < medications.length; j++) {
        const interaction = await this.getDrugInteraction(
          medications[i],
          medications[j]
        );
        if (interaction) interactions.push(interaction);
      }
    }
    return interactions;
  }
}

module.exports = PharmacyService;
