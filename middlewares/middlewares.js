const verifyAdmin = (req, res, next) => {
    // Add admin verification logic here
    next();
};

const verifyDoctor = (req, res, next) => {
    // Add doctor verification logic here
    next();
};

const verifyPatient = (req, res, next) => {
    // Add patient verification logic here
    next();
};

module.exports = {
    verifyAdmin,
    verifyDoctor,
    verifyPatient
};
