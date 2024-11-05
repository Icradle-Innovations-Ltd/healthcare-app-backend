const Provider = require('../models/Provider');
const User = require('../models/User');
const Appointment = require('../models/Appointment');

class ProviderService {
  static async getProviderSchedule(providerId, startDate, endDate) {
    const appointments = await Appointment.find({
      provider: providerId,
      dateTime: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    }).populate('patient', 'profile');

    const provider = await Provider.findById(providerId)
      .populate('availability');

    return {
      availability: provider.availability,
      appointments
    };
  }

  static async updateAvailability(providerId, availabilityData) {
    return await Provider.findByIdAndUpdate(
      providerId,
      { $set: { availability: availabilityData } },
      { new: true }
    );
  }

  static async getProviderAnalytics(providerId) {
    const appointments = await Appointment.aggregate([
      { $match: { provider: providerId } },
      { $group: {
        _id: '$status',
        count: { $sum: 1 }
      }}
    ]);

    const ratings = await Provider.aggregate([
      { $match: { _id: providerId } },
      { $unwind: '$reviews' },
      { $group: {
        _id: null,
        averageRating: { $avg: '$reviews.rating' },
        totalReviews: { $sum: 1 }
      }}
    ]);

    return { appointments, ratings: ratings[0] };
  }
}

module.exports = ProviderService;
