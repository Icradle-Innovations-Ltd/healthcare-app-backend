const Facility = require('../models/Facility');

class FacilityService {
  static async getAllFacilities(filters = {}) {
    const query = {};
    
    if (filters.location) {
      query.location = { $regex: filters.location, $options: 'i' };
    }
    
    if (filters.services) {
      query.services = { $in: filters.services };
    }

    return await Facility.find(query)
      .populate('providers', 'profile specialization')
      .sort({ name: 1 });
  }

  static async getFacilityDetails(facilityId) {
    const facility = await Facility.findById(facilityId)
      .populate('providers')
      .populate('services');
      
    return facility;
  }

  static async updateFacilitySchedule(facilityId, scheduleData) {
    return await Facility.findByIdAndUpdate(
      facilityId,
      { $set: { operatingHours: scheduleData } },
      { new: true }
    );
  }

  static async addProvider(facilityId, providerId) {
    return await Facility.findByIdAndUpdate(
      facilityId,
      { $addToSet: { providers: providerId } },
      { new: true }
    );
  }
}

module.exports = FacilityService;
