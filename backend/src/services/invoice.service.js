const PDFDocument = require('pdfkit');
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

/**
 * Uploads a file buffer to Cloudinary
 * Reusing the same logic from utils, but explicitly setting resource_type: 'raw' for PDFs
 */
const uploadPdfToCloudinary = (fileBuffer, folder = 'pennywise/invoices') => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'raw', // Important for PDFs
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    streamifier.createReadStream(fileBuffer).pipe(uploadStream);
  });
};

/**
 * Generates an invoice PDF using pdfkit and uploads it to Cloudinary
 * @param {Object} order The fully populated order document
 * @returns {Promise<String>} The URL of the uploaded PDF
 */
const generateAndUploadInvoice = async (order) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const buffers = [];
      
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', async () => {
        try {
          const pdfData = Buffer.concat(buffers);
          const uploadResult = await uploadPdfToCloudinary(pdfData);
          resolve(uploadResult.secure_url);
        } catch (error) {
          reject(error);
        }
      });

      // --- Invoice Content ---
      
      // Header
      doc
        .fillColor('#005461')
        .fontSize(24)
        .text('PennyWise Invoice', { align: 'center' })
        .moveDown();

      doc
        .fillColor('#333333')
        .fontSize(10)
        .text(`Order ID: ${order._id.toString()}`)
        .text(`Date: ${new Date(order.created_at).toLocaleDateString()}`)
        .moveDown();

      // Addresses
      doc.fontSize(12).text('Billed To:', { underline: true }).moveDown(0.5);
      
      const buyer = order.buyer_id || {};
      doc.fontSize(10)
        .text(buyer.name || 'Valued Customer')
        .text(buyer.email || '')
        .moveDown();
        
      if (order.shipping_address) {
        doc.text('Shipping Address:')
          .text(order.shipping_address.full_name || '')
          .text(order.shipping_address.address || '')
          .text(`${order.shipping_address.city || ''}, ${order.shipping_address.phone || ''}`)
          .moveDown();
      }

      doc.fontSize(12).text('Sold By:', { underline: true }).moveDown(0.5);
      const seller = order.seller_id || {};
      doc.fontSize(10)
        .text(seller.store_name || 'PennyWise Seller')
        .text(seller.email || '')
        .moveDown(2);

      // Table Header
      const tableTop = doc.y;
      doc.font('Helvetica-Bold');
      doc.text('Item', 50, tableTop);
      doc.text('Qty', 350, tableTop, { width: 50, align: 'right' });
      doc.text('Price', 400, tableTop, { width: 70, align: 'right' });
      doc.text('Total', 470, tableTop, { width: 70, align: 'right' });

      doc.moveTo(50, tableTop + 15).lineTo(540, tableTop + 15).stroke();
      doc.font('Helvetica');

      // Table Rows
      let y = tableTop + 25;
      for (const item of order.items) {
        doc.text(item.product_name, 50, y, { width: 300 });
        doc.text(item.quantity.toString(), 350, y, { width: 50, align: 'right' });
        doc.text(`PKR ${item.price.toLocaleString()}`, 400, y, { width: 70, align: 'right' });
        doc.text(`PKR ${(item.price * item.quantity).toLocaleString()}`, 470, y, { width: 70, align: 'right' });
        
        y += 20;
        if (y > 700) {
          doc.addPage();
          y = 50;
        }
      }

      doc.moveTo(50, y + 10).lineTo(540, y + 10).stroke();

      // Total
      y += 25;
      doc.font('Helvetica-Bold');
      doc.text('Total Amount:', 350, y, { width: 120, align: 'right' });
      doc.text(`PKR ${order.total_amount.toLocaleString()}`, 470, y, { width: 70, align: 'right' });

      // Footer
      doc.font('Helvetica');
      doc.fontSize(10).text('Thank you for shopping with PennyWise!', 50, 700, { align: 'center', width: 500 });

      // Finalize PDF
      doc.end();

    } catch (error) {
      reject(error);
    }
  });
};

module.exports = {
  generateAndUploadInvoice,
};
