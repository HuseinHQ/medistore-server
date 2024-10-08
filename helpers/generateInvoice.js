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
  const headerY = doc.y; // Get the current y-coordinate for the item row

  // Print the item name
  doc.fontSize(12).text('Quantity', 50, headerY, { width: 150 });

  // Print the other columns at the same y-coordinate
  doc.text('Quantity', 200, headerY).text('Price', 280, headerY).text('Total', 350, headerY);
  doc.moveDown();

  // Table Rows
  transactions.TransactionDetails.forEach((transaction) => {
    const itemY = doc.y; // Get the current y-coordinate for the item row

    // Calculate the height of the item name text block
    const itemNameHeight = doc.heightOfString(transaction.Item.name, { width: 150 });

    // Print the item name
    doc.fontSize(12).text(transaction.Item.name, 50, itemY, { width: 150 });

    // Print the other columns at the same y-coordinate
    doc
      .text(transaction.quantity, 200, itemY)
      .text(`Rp ${transaction.Item.price.toLocaleString()}`, 280, itemY)
      .text(`Rp ${transaction.totalPrice.toLocaleString()}`, 350, itemY);

    // Move down by the height of the tallest text block
    doc.moveDown(itemNameHeight / doc.currentLineHeight());
  });

  // Footer
  doc.fontSize(10).text('Thank you for your business!', 50, 700, { align: 'center', width: 500 });

  doc.end();

  return `pdf/${transactions.orderId}.pdf`;
};

module.exports = generateInvoice;
