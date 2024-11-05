const Invoice = require('../models/Invoice');
const Payment = require('../models/Payment');
const InsuranceClaim = require('../models/InsuranceClaim');

class BillingService {
  static async generateInvoice(appointmentId) {
    const appointment = await Appointment.findById(appointmentId)
      .populate('patient provider service');

    const invoice = await Invoice.create({
      appointment: appointmentId,
      patient: appointment.patient._id,
      provider: appointment.provider._id,
      items: this.calculateInvoiceItems(appointment),
      total: this.calculateTotal(appointment),
      dueDate: this.calculateDueDate()
    });

    return invoice;
  }

  static async processPayment(paymentData) {
    const payment = await Payment.create({
      invoice: paymentData.invoiceId,
      amount: paymentData.amount,
      method: paymentData.method,
      status: 'processing'
    });

    const processedPayment = await this.processPaymentWithGateway(payment);
    return processedPayment;
  }

  static async submitInsuranceClaim(invoiceId) {
    const invoice = await Invoice.findById(invoiceId)
      .populate('patient provider');

    const claim = await InsuranceClaim.create({
      invoice: invoiceId,
      patient: invoice.patient._id,
      provider: invoice.provider._id,
      amount: invoice.total,
      status: 'submitted'
    });

    return claim;
  }
}

module.exports = BillingService;
