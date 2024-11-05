// Limited access functionalities for non-registered users
exports.viewInformation = (req, res) => {
    res.status(200).json({ message: 'This is limited information for visitors.' });
  };
  