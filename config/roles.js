const roles = {
    Admin: {
      permissions: ["manageUsers", "viewAllData", "configureSystem", "manageFacilities"]
    },
    HealthcareProvider: {
      permissions: ["viewAssignedPatients", "diagnose", "prescribe", "orderTests"]
    },
    Patient: {
      permissions: ["viewOwnProfile", "bookAppointment", "viewTestResults", "messageProvider"]
    },
    Visitor: {
      permissions: ["viewPublicInfo"]
    }
  };
  
  module.exports = roles;
  