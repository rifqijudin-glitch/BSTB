/**
 * =========================================================================
 * GOOGLE APPS SCRIPT - SISTEM BSTB MULTI DEPARTEMEN & LOGIN ADMIN
 * PT MITRA MULTI PACKAGING
 * Spreadsheet ID: 1LrkFlhSFE5dkYzWYb4jqtnXkt5uaojXobRlaE9godQEnCK4OS8Efn22Y
 * =========================================================================
 */

var SPREADSHEET_ID = "1LrkFlhSFE5dkYzWYb4jqtnXkt5uaojXobRlaE9godQEnCK4OS8Efn22Y";

function getSpreadsheet() {
  try {
    return SpreadsheetApp.openById(SPREADSHEET_ID);
  } catch (e) {
    return SpreadsheetApp.getActiveSpreadsheet();
  }
}

/**
 * SETUP SHEET (Jalankan sekali jika ingin merapikan sheet dan header)
 */
function setupSheet() {
  var ss = getSpreadsheet();

  // 1. SETUP SHEET TEKNIK (10 Kolom - Selesai di Keterangan)
  var sheetTek = ss.getSheetByName("Teknik");
  if (!sheetTek) sheetTek = ss.insertSheet("Teknik");
  sheetTek.getRange("A1:Z1").clearContent().clearFormat();

  var headersTek = [
    "No", "Timestamp", "Nomor BSTB", "Tanggal BSTB", "Kode Barang",
    "Nama Barang", "Jumlah", "Satuan", "Berat (Kg)", "Keterangan"
  ];
  sheetTek.getRange(1, 1, 1, headersTek.length).setValues([headersTek]);
  var hTek = sheetTek.getRange(1, 1, 1, headersTek.length);
  hTek.setBackground("#1d4ed8").setFontColor("#ffffff").setFontWeight("bold");
  sheetTek.setFrozenRows(1);

  // 2. SETUP SHEET PRODUKSI (12 Kolom - Selesai di Keterangan)
  var sheetProd = ss.getSheetByName("Produksi");
  if (!sheetProd) sheetProd = ss.insertSheet("Produksi");
  sheetProd.getRange("A1:Z1").clearContent().clearFormat();

  var headersProd = [
    "No", "Timestamp", "Nomor BSTB", "Tanggal BSTB", "Kode Item",
    "Nama Item", "QTY", "Tgl Masuk", "Batch #", "Satuan", "SPK", "Keterangan"
  ];
  sheetProd.getRange(1, 1, 1, headersProd.length).setValues([headersProd]);
  var hProd = sheetProd.getRange(1, 1, 1, headersProd.length);
  hProd.setBackground("#0f766e").setFontColor("#ffffff").setFontWeight("bold");
  sheetProd.setFrozenRows(1);

  // 3. SETUP SHEET LOGIN
  var sheetLogin = ss.getSheetByName("Login");
  if (!sheetLogin) sheetLogin = ss.insertSheet("Login");
  sheetLogin.getRange("A1:Z1").clearContent().clearFormat();

  var headersLogin = [
    "No", "Timestamp", "User ID", "PIN / Password", "Nama Admin", "Role / Akses", "Status"
  ];
  sheetLogin.getRange(1, 1, 1, headersLogin.length).setValues([headersLogin]);
  var hLogin = sheetLogin.getRange(1, 1, 1, headersLogin.length);
  hLogin.setBackground("#334155").setFontColor("#ffffff").setFontWeight("bold");
  sheetLogin.setFrozenRows(1);

  if (sheetLogin.getLastRow() <= 1) {
    var tsStr = Utilities.formatDate(new Date(), "Asia/Jakarta", "yyyy-MM-dd HH:mm:ss");
    sheetLogin.appendRow([1, tsStr, "admin", "1234", "Admin HCGA", "Pemilik / Super Admin", "Aktif"]);
  }

  Logger.log("Setup Berhasil! Sheet Teknik, Produksi, dan Login telah rapi.");
}

/**
 * doGet:
 * - Jika ada param ?action=getData: mengembalikan seluruh data BSTB & Login dalam bentuk JSON
 * - Jika dibuka di browser: menampilkan status Webhook online
 */
function doGet(e) {
  var action = (e && e.parameter && e.parameter.action) ? e.parameter.action : "";

  if (action === "getData") {
    try {
      var ss = getSpreadsheet();
      var dataTeknik = [];
      var dataProduksi = [];

      // Ambil data Teknik
      var sheetTek = ss.getSheetByName("Teknik");
      if (sheetTek && sheetTek.getLastRow() > 1) {
        var rowsTek = sheetTek.getRange(2, 1, sheetTek.getLastRow() - 1, 10).getValues();
        for (var i = 0; i < rowsTek.length; i++) {
          var r = rowsTek[i];
          if (!r[2]) continue; // jika nomor BSTB kosong
          dataTeknik.push({
            no: r[0],
            timestamp: r[1],
            noBstb: r[2],
            tanggal: r[3] ? Utilities.formatDate(new Date(r[3]), "Asia/Jakarta", "yyyy-MM-dd") : "",
            kodeBarang: r[4],
            namaBarang: r[5],
            jumlah: r[6],
            satuan: r[7],
            beratKg: r[8],
            keterangan: r[9]
          });
        }
      }

      // Ambil data Produksi
      var sheetProd = ss.getSheetByName("Produksi");
      if (sheetProd && sheetProd.getLastRow() > 1) {
        var rowsProd = sheetProd.getRange(2, 1, sheetProd.getLastRow() - 1, 12).getValues();
        for (var j = 0; j < rowsProd.length; j++) {
          var p = rowsProd[j];
          if (!p[2]) continue;
          dataProduksi.push({
            no: p[0],
            timestamp: p[1],
            noBstb: p[2],
            tanggal: p[3] ? Utilities.formatDate(new Date(p[3]), "Asia/Jakarta", "yyyy-MM-dd") : "",
            kodeItem: p[4],
            namaItem: p[5],
            qty: p[6],
            tglMasuk: p[7] ? Utilities.formatDate(new Date(p[7]), "Asia/Jakarta", "yyyy-MM-dd") : "",
            batchNo: p[8],
            satuan: p[9],
            spk: p[10],
            keterangan: p[11]
          });
        }
      }

      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        teknik: dataTeknik,
        produksi: dataProduksi
      })).setMimeType(ContentService.MimeType.JSON);

    } catch (err) {
      return ContentService.createTextOutput(JSON.stringify({
        status: "error",
        message: err.toString()
      })).setMimeType(ContentService.MimeType.JSON);
    }
  }

  // Tampilan status saat dibuka langsung di browser
  var html = '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Webhook Status</title></head>' +
    '<body style="font-family:Arial,sans-serif;text-align:center;padding:50px;">' +
    '<h3>Webhook PT Mitra Multi Packaging Aktif</h3>' +
    '<p style="color:#059669;font-weight:bold;">Status: Sinkronisasi 2-Arah Dashboard & Sheet Siap</p>' +
    '</body></html>';
  return HtmlService.createHtmlOutput(html).setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * doPost:
 * - action: 'register' -> simpan akun baru ke sheet Login
 * - action: 'delete'   -> hapus baris BSTB dari sheet Google Spreadsheet secara permanen
 * - default (BSTB)     -> simpan data BSTB ke sheet Teknik atau Produksi
 */
function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return ContentService.createTextOutput(JSON.stringify({
        status: "error", message: "Tidak ada data postData yang diterima"
      })).setMimeType(ContentService.MimeType.JSON);
    }

    var data = JSON.parse(e.postData.contents);
    var ss = getSpreadsheet();
    var timestampStr = Utilities.formatDate(new Date(), "Asia/Jakarta", "yyyy-MM-dd HH:mm:ss");

    // ========================================================
    // 1. HAPUS DATA DARI GOOGLE SPREADSHEET (SINKRONISASI HAPUS)
    // ========================================================
    if (data.action === "delete") {
      var noBstbToDelete = (data.noBstb || "").trim();
      var deptToDelete = (data.departemen || "").toLowerCase();
      var deletedRowsCount = 0;

      var sheetNames = deptToDelete === "teknik" ? ["Teknik"] : deptToDelete === "produksi" ? ["Produksi"] : ["Teknik", "Produksi"];

      for (var s = 0; s < sheetNames.length; s++) {
        var sh = ss.getSheetByName(sheetNames[s]);
        if (!sh || sh.getLastRow() <= 1) continue;

        // Loop dari bawah ke atas agar penghapusan baris tidak merusak indeks
        for (var r = sh.getLastRow(); r >= 2; r--) {
          var cellValue = String(sh.getRange(r, 3).getValue()).trim(); // Kolom C adalah Nomor BSTB
          if (cellValue === noBstbToDelete) {
            sh.deleteRow(r);
            deletedRowsCount++;
          }
        }
      }

      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        message: "Data BSTB berhasil dihapus dari Google Spreadsheet",
        deletedRows: deletedRowsCount,
        noBstb: noBstbToDelete
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // ========================================================
    // 2. PENDAFTARAN AKUN BARU KE TAB SHEET LOGIN
    // ========================================================
    if (data.action === "register") {
      var sheetLogin = ss.getSheetByName("Login");
      if (!sheetLogin) { setupSheet(); sheetLogin = ss.getSheetByName("Login"); }

      var lastRow = sheetLogin.getLastRow();
      var newNo = Math.max(1, lastRow);

      sheetLogin.appendRow([
        newNo,
        timestampStr,
        data.userId || "",
        data.password || "",
        data.nama || "",
        data.role || "Admin HCGA",
        "Aktif"
      ]);

      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        message: "Akun berhasil didaftarkan ke sheet Login",
        userId: data.userId
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // ========================================================
    // 3. PENYIMPANAN DATA BSTB TEKNIK / PRODUKSI
    // ========================================================
    var dept = (data.departemen || "").toLowerCase();
    var isTeknik = dept.indexOf("teknik") !== -1 || (data.noDokumen && data.noDokumen.indexOf("TNK") !== -1);

    if (isTeknik) {
      // SHEET TEKNIK (10 Kolom)
      var sheet = ss.getSheetByName("Teknik");
      if (!sheet) { setupSheet(); sheet = ss.getSheetByName("Teknik"); }

      var items = data.items || data.itemsTeknik || [];
      var rowsToAppend = [];
      var currentLastRow = sheet.getLastRow();
      var startingNo = Math.max(1, currentLastRow);

      for (var i = 0; i < items.length; i++) {
        var it = items[i];
        if (!it.namaBarang && !it.kodeBarang && !it.jumlah) continue;

        rowsToAppend.push([
          startingNo + i,
          timestampStr,
          data.noBstb || "",
          data.tanggal || "",
          it.kodeBarang || it.kode || "",
          it.namaBarang || it.nama || "",
          it.jumlah !== undefined && it.jumlah !== "" ? it.jumlah : "",
          it.satuan || "",
          it.beratKg !== undefined && it.beratKg !== "" ? it.beratKg : "",
          it.keterangan || ""
        ]);
      }

      if (rowsToAppend.length > 0) {
        sheet.getRange(currentLastRow + 1, 1, rowsToAppend.length, rowsToAppend[0].length).setValues(rowsToAppend);
      }

      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        targetSheet: "Teknik",
        rowsInserted: rowsToAppend.length
      })).setMimeType(ContentService.MimeType.JSON);

    } else {
      // SHEET PRODUKSI (12 Kolom)
      var sheet = ss.getSheetByName("Produksi");
      if (!sheet) { setupSheet(); sheet = ss.getSheetByName("Produksi"); }

      var items = data.items || data.itemsProduksi || [];
      var rowsToAppend = [];
      var currentLastRow = sheet.getLastRow();
      var startingNo = Math.max(1, currentLastRow);

      for (var i = 0; i < items.length; i++) {
        var it = items[i];
        if (!it.namaItem && !it.kodeItem && !it.qty) continue;

        rowsToAppend.push([
          startingNo + i,
          timestampStr,
          data.noBstb || "",
          data.tanggal || "",
          it.kodeItem || it.kode || "",
          it.namaItem || it.nama || "",
          it.qty !== undefined && it.qty !== "" ? it.qty : "",
          it.tglMasuk || "",
          it.batchNo || "",
          it.satuan || "",
          it.spk || "",
          it.keterangan || ""
        ]);
      }

      if (rowsToAppend.length > 0) {
        sheet.getRange(currentLastRow + 1, 1, rowsToAppend.length, rowsToAppend[0].length).setValues(rowsToAppend);
      }

      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        targetSheet: "Produksi",
        rowsInserted: rowsToAppend.length
      })).setMimeType(ContentService.MimeType.JSON);
    }

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
