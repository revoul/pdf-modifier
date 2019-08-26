import { PDFDocument, StandardFonts, rgb, degrees } from 'pdf-lib'
import fs, { read } from 'fs';

const DIFF_ROW = 12.45;
const FIRST_POSITION = 595 + DIFF_ROW;

async function readFile(path) {
    const promise = new Promise((resolve, reject) => {
        fs.readFile(path, (err, data) => {
            if (err) {
                console.log(`Error into readFile: ${err}`);
                reject(err);
            } else resolve(data); 
        });
    });
    return promise;
}

const printRow = async (rowNumber, font, pngImage, pngDims, page) => {

    page.drawText('8:00', {
        x: 65,
        y: FIRST_POSITION - (rowNumber * DIFF_ROW),
        size: 9,
        font,
        color: rgb(0, 0, 0),
    });

    page.drawText('17:00', {
        x: 205,
        y: FIRST_POSITION - (rowNumber * DIFF_ROW),
        size: 9,
        font,
        color: rgb(0, 0, 0),
    });

    page.drawText('8', {
        x: 350,
        y: FIRST_POSITION - (rowNumber * DIFF_ROW),
        size: 9,
        font,
        color: rgb(0, 0, 0),
    });

    page.drawImage(pngImage, {
        x: 145,
        y: FIRST_POSITION - (rowNumber * DIFF_ROW),
        width: pngDims.width,
        height: pngDims.height,
    });

    page.drawImage(pngImage, {
        x: 145 + 140,
        y: FIRST_POSITION - (rowNumber * DIFF_ROW),
        width: pngDims.width,
        height: pngDims.height,
    });
};

const printLastSign = async (jpgImage, jpgDims, page) => {
    page.drawImage(jpgImage, {
        x: page.getWidth() / 2 - jpgDims.width / 2,
        y: 94,
        width: jpgDims.width,
        height: jpgDims.height,
    });
};

export const modifyPdf = async dayArray => {
    const existingPdfBytes = await readFile('entry.pdf');
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];

    /* modify */

    // set rows
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const pngImageBytes = await readFile('images/sign-small.png');
    const pngImage = await pdfDoc.embedPng(pngImageBytes);
    const pngDims = pngImage.scale(0.20);
    dayArray.forEach(row => printRow(row, helveticaFont, pngImage, pngDims, firstPage));
    
    // set final sign
    const jpgImageBytes = await readFile('images/sign-big.jpg');
    const jpgImage = await pdfDoc.embedJpg(jpgImageBytes);
    const jpgDims = jpgImage.scale(0.05);
    printLastSign(jpgImage, jpgDims, firstPage);

    /* save */

    const pdfBytes = await pdfDoc.save();
    fs.writeFile(`out.pdf`, pdfBytes, function (err) {
        if (err) throw err;
        console.log('File is created successfully.');
    });
};

// set days
modifyPdf([1,2,5,6,7,8,9,12,13,14,15,16,26,27,30]);
