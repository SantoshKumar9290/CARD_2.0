
const fsone = require("fs");
const pdfjsLib = require("pdfjs-dist");
async function extractTextWithPositionsFromPDF (pdfFilePath) {
    const data = new Uint8Array(fsone.readFileSync(pdfFilePath));
    const loadingTask = pdfjsLib.getDocument({ data });
    const pdfDocument = await loadingTask.promise;

    let textWithPositions = [];

    for (let i = 1; i <= pdfDocument.numPages; i++) {
      const page = await pdfDocument.getPage(i);
      const content = await page.getTextContent();
      content.items.forEach((item) => {
        textWithPositions.push({
          text: item.str,
          position: {
            x: item.transform[4],
            y: item.transform[5],
          },
          page: i,
        });
      });
    }

    return textWithPositions;
  };
  module.exports = { extractTextWithPositionsFromPDF };