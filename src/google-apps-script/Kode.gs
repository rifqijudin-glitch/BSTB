/**
 * GOOGLE APPS SCRIPT - BSTB MULTI DEPARTEMEN (PT MITRA MULTI PACKAGING)
 * Spreadsheet ID: 1LrkFlhSFE5dkYzWYb4jqtnXkt5uaojXobRlaE9godQEnCK4OS8Efn22Y
 * 
 * ATURAN HEADER SPREADSHEET (STRICT - HANYA SAMPAI KOLOM KETERANGAN):
 * 
 * 1. Sheet "Teknik" (Tepat 10 Kolom):
 *    No | Timestamp | Nomor BSTB | Tanggal BSTB | Kode Barang | Nama Barang | Jumlah | Satuan | Berat (Kg) | Keterangan
 * 
 * 2. Sheet "Produksi" (Tepat 12 Kolom):
 *    No | Timestamp | Nomor BSTB | Tanggal BSTB | Kode Item | Nama Item | QTY | Tgl Masuk | Batch # | Satuan | SPK | Keterangan
 * 
 * CATATAN PENTING:
 * - Tidak ada kolom tambahan setelah Keterangan (TIDAK ADA kolom tanda tangan / diketahui oleh / diterima oleh).
 * - Format sheet otomatis dirapikan, dibold headernya, dan auto-resize.
 */

var SPREADSHEET_ID = "1LrkFlhSFE5dkYzWYb4jqtnXkt5uaojXobRlaE9godQEnCK4OS8Efn22Y";

var HEADERS_TEKNIK = [
  "No",
  "Timestamp",
  "Nomor BSTB",
  "Tanggal BSTB",
  "Kode Barang",
  "Nama Barang",
  "Jumlah",
  "Satuan",
  "Berat (Kg)",
  "Keterangan"
];

var HEADERS_PRODUKSI = [
  "No",
  "Timestamp",
  "Nomor BSTB",
  "Tanggal BSTB",
  "Kode Item",
  "Nama Item",
  "QTY",
  "Tgl Masuk",
  "Batch #",
  "Satuan",
  "SPK",
  "Keterangan"
];

function doGet(e) {
  return ContentService.createTextOutput(
    JSON.stringify({
      status: "success",
      message: "Webhook BSTB PT Mitra Multi Packaging Aktif & Siap Menerima Data.",
      sheets: ["Teknik", "Produksi"]
    })
  ).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    var rawData = e.postData.contents;
    var data = JSON.parse(rawData);

    var ss = SPREADSHEET_ID 
      ? SpreadsheetApp.openById(SPREADSHEET_ID) 
      : SpreadsheetApp.getActiveSpreadsheet();

    var deptType = (data.departemen || "produksi").toLowerCase();
    var sheetName = deptType === "teknik" ? "Teknik" : "Produksi";
    var headers = deptType === "teknik" ? HEADERS_TEKNIK : HEADERS_PRODUKSI;

    // Ambil atau buat sheet jika belum ada
    var sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      sheet.appendRow(headers);
      var headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setFontWeight("bold");
      headerRange.setBackground("#f1f5f9");
      headerRange.setHorizontalAlignment("center");
      sheet.setFrozenRows(1);
    } else {
      // Pastikan header baris 1 selalu sesuai aturan strict
      var currentHeaders = sheet.getRange(1, 1, 1, headers.length).getValues()[0];
      var match = true;
      for (var h = 0; h < headers.length; h++) {
        if (currentHeaders[h] !== headers[h]) {
          match = false;
          break;
        }
      }
      if (!match) {
        sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
        var hr = sheet.getRange(1, 1, 1, headers.length);
        hr.setFontWeight("bold");
        hr.setBackground("#f1f5f9");
        hr.setHorizontalAlignment("center");
        sheet.setFrozenRows(1);
      }
    }

    var nowStr = Utilities.formatDate(new Date(), "Asia/Jakarta", "yyyy-MM-dd HH:mm:ss");
    var noBstb = data.noBstb || "-";
    var tanggalBstb = data.tanggal || "-";
    var items = data.items || [];

    // Jika tidak ada item terinci, simpan 1 baris umum
    if (!items || items.length === 0) {
      items = [{}];
    }

    var rowsToInsert = [];
    var lastRow = sheet.getLastRow();
    var startNo = Math.max(1, lastRow); // Menghitung urutan No

    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      var rowNumber = (lastRow <= 1 ? 1 : lastRow) + i;

      if (deptType === "teknik") {
        // Strict 10 kolom untuk Teknik:
        // No, Timestamp, Nomor BSTB, Tanggal BSTB, Kode Barang, Nama Barang, Jumlah, Satuan, Berat (Kg), Keterangan
        rowsToInsert.push([
          rowNumber,
          nowStr,
          noBstb,
          tanggalBstb,
          item.kodeBarang || "-",
          item.namaBarang || "-",
          item.jumlah || "",
          item.satuan || "Kg",
          item.beratKg || "",
          item.keterangan || ""
        ]);
      } else {
        // Strict 12 kolom untuk Produksi:
        // No, Timestamp, Nomor BSTB, Tanggal BSTB, Kode Item, Nama Item, QTY, Tgl Masuk, Batch #, Satuan, SPK, Keterangan
        rowsToInsert.push([
          rowNumber,
          nowStr,
          noBstb,
          tanggalBstb,
          item.kodeItem || "-",
          item.namaItem || "-",
          item.qty || "",
          item.tglMasuk || "",
          item.batchNo || "",
          item.satuan || "Kg",
          item.spk || "",
          item.keterangan || ""
        ]);
      }
    }

    if (rowsToInsert.length > 0) {
      sheet.getRange(lastRow + 1, 1, rowsToInsert.length, headers.length).setValues(rowsToInsert);
      sheet.autoResizeColumns(1, headers.length);
    }

    return ContentService.createTextOutput(
      JSON.stringify({
        status: "success",
        sheet: sheetName,
        insertedCount: rowsToInsert.length,
        timestamp: nowStr
      })
    ).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({
        status: "error",
        message: error.toString()
      })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Fungsi bantuan satu kali klik untuk setup awal sheet jika ingin langsung siap
 */
function setupSheets() {
  var ss = SPREADSHEET_ID 
    ? SpreadsheetApp.openById(SPREADSHEET_ID) 
    : SpreadsheetApp.getActiveSpreadsheet();

  // Setup sheet Teknik
  var sheetTeknik = ss.getSheetByName("Teknik") || ss.insertSheet("Teknik");
  sheetTeknik.getRange(1, 1, 1, HEADERS_TEKNIK.length).setValues([HEADERS_TEKNIK]);
  var hrT = sheetTeknik.getRange(1, 1, 1, HEADERS_TEKNIK.length);
  hrT.setFontWeight("bold").setBackground("#e2e8f0").setHorizontalAlignment("center");
  sheetTeknik.setFrozenRows(1);
  sheetTeknik.autoResizeColumns(1, HEADERS_TEKNIK.length);

  // Setup sheet Produksi
  var sheetProduksi = ss.getSheetByName("Produksi") || ss.insertSheet("Produksi");
  sheetProduksi.getRange(1, 1, 1, HEADERS_PRODUKSI.length).setValues([HEADERS_PRODUKSI]);
  var hrP = sheetProduksi.getRange(1, 1, 1, HEADERS_PRODUKSI.length);
  hrP.setFontWeight("bold").setBackground("#e2e8f0").setHorizontalAlignment("center");
  sheetProduksi.setFrozenRows(1);
  sheetProduksi.autoResizeColumns(1, HEADERS_PRODUKSI.length);

  Logger.log("Setup Sheet Teknik dan Produksi berhasil!");
}
