const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');

const generateInvoice = (transactions) => {
  const doc = new PDFDocument({ margin: 50 });
  const pdfPath = `./public/pdf/${transactions.orderId}.pdf`;
  doc.pipe(fs.createWriteStream(pdfPath));
  const logoPath = path.resolve(__dirname, '../public/logo.png');

  // Header
  doc
    .image(logoPath, 50, 45, { width: 50 }) // Add your logo here
    .fillColor('#444444')
    .fontSize(20)
    .text('MediStore', 110, 57)
    .fontSize(10)
    .text('Jalan Bhaskara 7/33', 200, 65, { align: 'right' })
    .text('Surabaya, Jawa Timur, 60112', 200, 80, { align: 'right' })
    .moveDown();

  // Invoice Title
  doc.fillColor('#000000').fontSize(25).text('Transaction Invoice', { align: 'center' }).moveDown();

  // Transaction Details
  doc
    .fontSize(15)
    .text(`Order ID: ${transactions.orderId}`, { align: 'left' })
    .moveDown()
    .text(`Total: Rp ${transactions.total.toLocaleString()}`, { align: 'left' })
    .moveDown()
    .text('Items:', { align: 'left' })
    .moveDown();

  // Table Header
  doc
    .fontSize(12)
    .text('Item', 50, doc.y, { width: 300 })
    .text('Quantity', 200, doc.y)
    .text('Price', 280, doc.y)
    .text('Total', 350, doc.y)
    .moveDown();

  // Table Rows
  transactions.TransactionDetails.forEach((transaction) => {
    const itemY = doc.y; // Get the current y-coordinate for the item row
    doc
      .fontSize(12)
      .text(transaction.Item.name, 50, itemY, { width: 150 })
      .text(transaction.quantity, 200, itemY)
      .text(`Rp ${transaction.Item.price.toLocaleString()}`, 280, itemY)
      .text(`Rp ${transaction.totalPrice.toLocaleString()}`, 350, itemY)
      .moveDown();
  });

  // Footer
  doc.fontSize(10).text('Thank you for your business!', 50, 700, { align: 'center', width: 500 });

  doc.end();

  return `pdf/${transactions.orderId}.pdf`;
};

module.exports = generateInvoice;
