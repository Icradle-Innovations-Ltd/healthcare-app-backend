const db = require('../config/db');

const billingController = {
  createInvoice: (req, res) => {
    const { patientId, items, totalAmount, dueDate } = req.body;
    const sql = `
      INSERT INTO invoices (patientId, totalAmount, dueDate, status)
      VALUES (?, ?, ?, 'pending')
    `;

    db.run(sql, [patientId, totalAmount, dueDate], function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to create invoice' });
      }
      
      const invoiceId = this.lastID;
      const itemValues = items.map(item => 
        `(${invoiceId}, '${item.description}', ${item.amount})`
      ).join(',');

      const itemsSql = `
        INSERT INTO invoice_items (invoiceId, description, amount)
        VALUES ${itemValues}
      `;

      db.run(itemsSql, [], (err) => {
        if (err) {
          return res.status(500).json({ error: 'Failed to add invoice items' });
        }
        res.status(201).json({ id: invoiceId, message: 'Invoice created successfully' });
      });
    });
  },

  processPayment: (req, res) => {
    const { invoiceId, paymentMethod, amount } = req.body;
    const sql = `
      INSERT INTO payments (invoiceId, amount, paymentMethod, paymentDate)
      VALUES (?, ?, ?, CURRENT_TIMESTAMP)
    `;

    db.run(sql, [invoiceId, amount, paymentMethod], function(err) {
      if (err) {
        return res.status(500).json({ error: 'Payment processing failed' });
      }
      res.json({ id: this.lastID, message: 'Payment processed successfully' });
    });
  }
};

module.exports = billingController;
