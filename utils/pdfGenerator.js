const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

exports.generateReceipt = (repayment, loan, customer, shopName) => {
  return new Promise((resolve, reject) => {
    try {
      // Create a document
      const doc = new PDFDocument();
      const filename = `receipt_${loan._id}_${Date.now()}.pdf`;
      const filePath = path.join(__dirname, '..', 'receipts', filename);
      
      // Pipe its output to a file
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);
      
      // Add content
      doc.fontSize(25).text('Payment Receipt', { align: 'center' });
      doc.moveDown();
      doc.fontSize(15).text(`Shop: ${shopName}`);
      doc.fontSize(15).text(`Customer: ${customer.name}`);
      doc.fontSize(15).text(`Amount Paid: Rs. ${repayment.amount}`);
      doc.fontSize(15).text(`Date: ${repayment.date.toLocaleDateString()}`);
      doc.fontSize(15).text(`Remaining Balance: Rs. ${loan.remainingAmount}`);
      
      if (repayment.notes) {
        doc.moveDown();
        doc.fontSize(15).text(`Notes: ${repayment.notes}`);
      }
      
      // Finalize PDF file
      doc.end();
      
      stream.on('finish', () => {
        resolve(filePath);
      });
    } catch (error) {
      reject(error);
    }
  });
};