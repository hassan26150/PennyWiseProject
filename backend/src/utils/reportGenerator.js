const PDFDocument = require('pdfkit');
const { parse } = require('json2csv');
const { v2: cloudinary } = require('cloudinary');
const streamifier = require('streamifier');

/**
 * Uploads a buffer to Cloudinary
 */
const uploadToCloudinary = (buffer, format, folder) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'raw',
        folder: folder,
        format: format,
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url);
      }
    );
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

/**
 * Generates a CSV from JSON data and uploads to Cloudinary
 */
const generateAndUploadCSV = async (data, reportType) => {
  if (!data || !data.length) throw new Error('No data provided for CSV generation');
  
  const csvString = parse(data);
  const buffer = Buffer.from(csvString, 'utf8');
  
  return await uploadToCloudinary(buffer, 'csv', 'pennywise_reports');
};

/**
 * Generates a PDF from JSON data and uploads to Cloudinary
 */
const generateAndUploadPDF = async (data, reportType, title) => {
  if (!data || !data.length) throw new Error('No data provided for PDF generation');
  
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const buffers = [];

    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', async () => {
      const pdfBuffer = Buffer.concat(buffers);
      try {
        const url = await uploadToCloudinary(pdfBuffer, 'pdf', 'pennywise_reports');
        resolve(url);
      } catch (err) {
        reject(err);
      }
    });

    // Build PDF content
    doc.fontSize(20).text(`PennyWise Report: ${title}`, { align: 'center' });
    doc.moveDown();
    doc.fontSize(10).text(`Generated on: ${new Date().toLocaleString()}`, { align: 'center' });
    doc.moveDown(2);

    // Simple table implementation
    const keys = Object.keys(data[0]);
    const columnWidth = 500 / keys.length;

    // Table Header
    doc.font('Helvetica-Bold');
    let x = 50;
    const yHeader = doc.y;
    keys.forEach(key => {
      doc.text(key.toUpperCase(), x, yHeader, { width: columnWidth, align: 'left' });
      x += columnWidth;
    });
    doc.moveDown();
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown();

    // Table Rows
    doc.font('Helvetica');
    data.forEach(row => {
      // Check for page break
      if (doc.y > 700) {
        doc.addPage();
        doc.y = 50;
      }
      
      let xRow = 50;
      const yRow = doc.y;
      keys.forEach(key => {
        let val = row[key];
        if (typeof val === 'object') val = JSON.stringify(val);
        doc.text(String(val), xRow, yRow, { width: columnWidth, align: 'left', lineBreak: false });
        xRow += columnWidth;
      });
      doc.moveDown();
    });

    doc.end();
  });
};

module.exports = {
  generateAndUploadCSV,
  generateAndUploadPDF
};
