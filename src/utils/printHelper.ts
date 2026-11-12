/**
 * Helper cetak dokumen BSTB PT Mitra Multi Packaging
 * Sesuai kode printHTML yang diminta user
 */

export const printHTML = (htmlContent: string, title?: string, subtitle?: string) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Gagal membuka jendela cetak. Mohon izinkan pop-up untuk situs ini.');
    // Fallback cetak langsung jika pop-up diblokir browser
    printDocumentFallback(htmlContent);
    return;
  }

  const pageTitle = title ? `Laporan - ${title}` : document.title;
  const printDate = new Date().toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'long' });

  printWindow.document.open();
  printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="id">
      <head>
        <meta charset="UTF-8">
        <title>${pageTitle}</title>
        <style>
          @page {
            size: A4 portrait;
            margin: 15mm 10mm 12mm 10mm;
          }
          * {
            box-sizing: border-box;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          html, body {
            margin: 0;
            padding: 0;
            background: #ffffff !important;
            color: #000000 !important;
            font-family: Arial, Helvetica, sans-serif;
            width: 100%;
          }
          #printable-bstb-document {
            width: 100% !important;
            max-width: 195mm !important;
            margin: 0 auto !important;
            padding: 0 !important;
          }
          table {
            border-collapse: collapse;
            width: 100%;
            page-break-inside: avoid;
          }
          tr {
            page-break-inside: avoid;
          }
          td, th {
            border-color: #000000 !important;
          }
        </style>
      </head>
      <body>
        ${htmlContent}
        <script>
          window.onload = function() {
            window.focus();
            setTimeout(function() {
              window.print();
            }, 300);
          };
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
};

const printDocumentFallback = (htmlContent: string) => {
  try {
    const printIframe = document.createElement('iframe');
    printIframe.setAttribute(
      'style',
      'position: fixed; right: 0; bottom: 0; width: 0; height: 0; border: 0; visibility: hidden;'
    );
    document.body.appendChild(printIframe);

    const iframeDoc = printIframe.contentWindow?.document;
    if (!iframeDoc) {
      window.print();
      return;
    }

    iframeDoc.open();
    iframeDoc.write(`
      <!DOCTYPE html>
      <html lang="id">
        <head>
          <meta charset="UTF-8">
          <title>BSTB - PT Mitra Multi Packaging</title>
          <style>
            @page { size: A4 portrait; margin: 15mm 10mm 12mm 10mm; }
            * { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
            html, body { margin: 0; padding: 0; background: #fff !important; color: #000 !important; font-family: Arial, sans-serif; width: 100%; }
            #printable-bstb-document { width: 100% !important; max-width: 195mm !important; margin: 0 auto !important; padding: 0 !important; }
            table { border-collapse: collapse; width: 100%; page-break-inside: avoid; }
            tr { page-break-inside: avoid; }
            td, th { border-color: #000 !important; }
          </style>
        </head>
        <body>
          ${htmlContent}
        </body>
      </html>
    `);
    iframeDoc.close();

    setTimeout(() => {
      try {
        printIframe.contentWindow?.focus();
        printIframe.contentWindow?.print();
      } catch (err) {
        window.print();
      } finally {
        setTimeout(() => {
          if (document.body.contains(printIframe)) {
            document.body.removeChild(printIframe);
          }
        }, 3000);
      }
    }, 250);
  } catch (e) {
    window.print();
  }
};

export const printDocument = () => {
  const el = document.getElementById('printable-bstb-document');
  if (el) {
    printHTML(el.outerHTML, 'Bukti Serah Terima Barang');
  } else {
    window.print();
  }
};
