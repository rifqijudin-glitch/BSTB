export const RAW_KODE_GS = `/**
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
 * Helper untuk memformat tanggal secara aman tanpa error Invalid Date
 */
function safeFormatDate(val) {
  if (!val) return "";
  if (val instanceof Date) {
    try {
      return Utilities.formatDate(val, "Asia/Jakarta", "yyyy-MM-dd");
    } catch (e) {
      return "";
    }
  }
  var str = String(val).trim();
  if (/^\\d{4}-\\d{2}-\\d{2}$/.test(str)) return str;
  try {
    var d = new Date(str);
    if (!isNaN(d.getTime())) {
      return Utilities.formatDate(d, "Asia/Jakarta", "yyyy-MM-dd");
    }
  } catch (e) {}
  return str;
}

/**
 * FUNGSI OTOMATIS MERAPIKAN DAN MENGURUTKAN NOMOR (KOLOM A)
 * Nomor selalu berurutan rapi: 1, 2, 3, 4... dari atas ke bawah
 */
function renumberSheet(sheet) {
  if (!sheet || sheet.getLastRow() <= 1) return;
  var lastRow = sheet.getLastRow();
  var dataRange = sheet.getRange(2, 1, lastRow - 1, 3).getValues();
  var currentSeq = 0;
  var currentNoBstb = "";
  var noValues = [];

  for (var i = 0; i < dataRange.length; i++) {
    var bstbCell = String(dataRange[i][2] || "").trim();
    if (bstbCell && bstbCell !== currentNoBstb) {
      currentSeq++;
      currentNoBstb = bstbCell;
      noValues.push([currentSeq]);
    } else {
      noValues.push([""]);
    }
  }

  sheet.getRange(2, 1, noValues.length, 1).setValues(noValues);
}

/**
 * SETUP SHEET (Jalankan sekali di menu 'Run' untuk merapikan sheet dan header)
 */
function setupSheet() {
  var ss = getSpreadsheet();

  // 1. SETUP SHEET TEKNIK (11 Kolom - Termasuk No. FPB di Kolom 10)
  var sheetTek = ss.getSheetByName("Teknik");
  if (!sheetTek) sheetTek = ss.insertSheet("Teknik");
  sheetTek.getRange("A1:Z1").clearContent().clearFormat();

  var headersTek = [
    "No", "Timestamp", "Nomor BSTB", "Tanggal BSTB", "Kode Barang",
    "Nama Barang", "Jumlah", "Satuan", "Berat (Kg)", "No. FPB", "Keterangan"
  ];
  sheetTek.getRange(1, 1, 1, headersTek.length).setValues([headersTek]);
  var hTek = sheetTek.getRange(1, 1, 1, headersTek.length);
  hTek.setBackground("#1d4ed8").setFontColor("#ffffff").setFontWeight("bold");
  sheetTek.setFrozenRows(1);

  // 2. SETUP SHEET PRODUKSI (12 Kolom)
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

  // 3. SETUP SHEET SCM / GUDANG (12 Kolom - Persis Produksi)
  var sheetScm = ss.getSheetByName("SCM_Gudang");
  if (!sheetScm) sheetScm = ss.insertSheet("SCM_Gudang");
  sheetScm.getRange("A1:Z1").clearContent().clearFormat();

  var headersScm = [
    "No", "Timestamp", "Nomor BSTB", "Tanggal BSTB", "Kode Item",
    "Nama Item", "QTY", "Tgl Masuk", "Batch #", "Satuan", "SPK", "Keterangan"
  ];
  sheetScm.getRange(1, 1, 1, headersScm.length).setValues([headersScm]);
  var hScm = sheetScm.getRange(1, 1, 1, headersScm.length);
  hScm.setBackground("#b45309").setFontColor("#ffffff").setFontWeight("bold");
  sheetScm.setFrozenRows(1);

  // 4. SETUP SHEET LOGIN (8 Kolom Bersih & Rapi)
  var sheetLogin = ss.getSheetByName("Login");
  if (!sheetLogin) sheetLogin = ss.insertSheet("Login");
  sheetLogin.getRange("A1:Z1").clearContent().clearFormat();

  var headersLogin = [
    "No", "Timestamp", "User ID", "Email", "Password", "Nama Admin", "Role / Akses", "Status"
  ];
  sheetLogin.getRange(1, 1, 1, headersLogin.length).setValues([headersLogin]);
  var hLogin = sheetLogin.getRange(1, 1, 1, headersLogin.length);
  hLogin.setBackground("#334155").setFontColor("#ffffff").setFontWeight("bold");
  sheetLogin.setFrozenRows(1);

  if (sheetLogin.getLastRow() <= 1) {
    var tsStr = Utilities.formatDate(new Date(), "Asia/Jakarta", "yyyy-MM-dd HH:mm:ss");
    sheetLogin.appendRow([1, tsStr, "admin", "rifqi.judin@gmail.com", "*****", "Admin HCGA", "Pemilik / Super Admin", "Aktif"]);
  }

  Logger.log("Setup Berhasil! Sheet Teknik, Produksi, SCM_Gudang, dan Login telah rapi.");
}

/**
 * doGet:
 * - ?action=getData  : Ambil data BSTB Teknik & Produksi
 * - ?action=getUsers : Ambil akun dari tab Login untuk autentikasi
 */
function doGet(e) {
  var action = (e && e.parameter && e.parameter.action) ? e.parameter.action : "";

  if (action === "getData") {
    try {
      var ss = getSpreadsheet();
      var dataTeknik = [];
      var dataProduksi = [];

      var sheetTek = ss.getSheetByName("Teknik");
      if (sheetTek && sheetTek.getLastRow() > 1) {
        var rowsTek = sheetTek.getRange(2, 1, sheetTek.getLastRow() - 1, 11).getValues();
        var curTekNo = 1, curTekTs = "", curTekNoBstb = "", curTekTgl = "";

        for (var i = 0; i < rowsTek.length; i++) {
          var r = rowsTek[i];
          if (r[2]) {
            curTekNo = r[0];
            curTekTs = r[1];
            curTekNoBstb = r[2];
            curTekTgl = safeFormatDate(r[3]);
          }
          if (!curTekNoBstb || (!r[4] && !r[5] && !r[6])) continue;

          dataTeknik.push({
            no: curTekNo, timestamp: curTekTs, noBstb: curTekNoBstb, tanggal: curTekTgl,
            kodeBarang: r[4], namaBarang: r[5], jumlah: r[6], satuan: r[7],
            beratKg: r[8], noFpb: r[9], keterangan: r[10]
          });
        }
      }

      var sheetProd = ss.getSheetByName("Produksi");
      if (sheetProd && sheetProd.getLastRow() > 1) {
        var rowsProd = sheetProd.getRange(2, 1, sheetProd.getLastRow() - 1, 12).getValues();
        var curProdNo = 1, curProdTs = "", curProdNoBstb = "", curProdTgl = "";

        for (var j = 0; j < rowsProd.length; j++) {
          var p = rowsProd[j];
          if (p[2]) {
            curProdNo = p[0];
            curProdTs = p[1];
            curProdNoBstb = p[2];
            curProdTgl = safeFormatDate(p[3]);
          }
          if (!curProdNoBstb || (!p[4] && !p[5] && !p[6])) continue;

          dataProduksi.push({
            no: curProdNo, timestamp: curProdTs, noBstb: curProdNoBstb, tanggal: curProdTgl,
            kodeItem: p[4], namaItem: p[5], qty: p[6], tglMasuk: safeFormatDate(p[7]),
            batchNo: p[8], satuan: p[9], spk: p[10], keterangan: p[11]
          });
        }
      }

      var sheetScm = ss.getSheetByName("SCM_Gudang");
      var dataScm = [];
      if (sheetScm && sheetScm.getLastRow() > 1) {
        var rowsScm = sheetScm.getRange(2, 1, sheetScm.getLastRow() - 1, 12).getValues();
        var curScmNo = 1, curScmTs = "", curScmNoBstb = "", curScmTgl = "";

        for (var k = 0; k < rowsScm.length; k++) {
          var s = rowsScm[k];
          if (s[2]) {
            curScmNo = s[0];
            curScmTs = s[1];
            curScmNoBstb = s[2];
            curScmTgl = safeFormatDate(s[3]);
          }
          if (!curScmNoBstb || (!s[4] && !s[5] && !s[6])) continue;

          dataScm.push({
            no: curScmNo, timestamp: curScmTs, noBstb: curScmNoBstb, tanggal: curScmTgl,
            kodeItem: s[4], namaItem: s[5], qty: s[6], tglMasuk: safeFormatDate(s[7]),
            batchNo: s[8], satuan: s[9], spk: s[10], keterangan: s[11]
          });
        }
      }

      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        teknik: dataTeknik,
        produksi: dataProduksi,
        scm: dataScm
      })).setMimeType(ContentService.MimeType.JSON);

    } catch (err) {
      return ContentService.createTextOutput(JSON.stringify({
        status: "error", message: err.toString()
      })).setMimeType(ContentService.MimeType.JSON);
    }
  }

  if (action === "getUsers") {
    try {
      var ss = getSpreadsheet();
      var sheetLogin = ss.getSheetByName("Login");
      var usersList = [];
      if (sheetLogin && sheetLogin.getLastRow() > 1) {
        var rows = sheetLogin.getRange(2, 1, sheetLogin.getLastRow() - 1, 8).getValues();
        for (var u = 0; u < rows.length; u++) {
          var r = rows[u];
          if (r[2]) {
            usersList.push({
              userId: String(r[2]).trim().toLowerCase(),
              email: String(r[3] || "").trim().toLowerCase(),
              nama: r[5] || "Admin HCGA",
              role: r[6] || "Admin HCGA",
              status: r[7] || "Aktif"
            });
          }
        }
      }
      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        users: usersList
      })).setMimeType(ContentService.MimeType.JSON);
    } catch (err) {
      return ContentService.createTextOutput(JSON.stringify({
        status: "error", message: err.toString()
      })).setMimeType(ContentService.MimeType.JSON);
    }
  }

  var html = '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Webhook Status</title></head>' +
    '<body style="font-family:Arial,sans-serif;text-align:center;padding:50px;">' +
    '<h3>Webhook PT Mitra Multi Packaging Aktif</h3>' +
    '<p style="color:#059669;font-weight:bold;">Status: Sinkronisasi 2-Arah Dashboard & Sheet Siap</p>' +
    '</body></html>';
  return HtmlService.createHtmlOutput(html).setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * doPost:
 * - action: 'register'        -> Simpan akun baru
 * - action: 'googleAuth'      -> Daftar / Login langsung dengan Akun Google
 * - action: 'changePassword'  -> Ganti password
 * - action: 'resetPassword'   -> Reset password
 * - action: 'sendResetEmail'  -> Kirim kode OTP reset password ke email pengguna
 * - action: 'edit' / 'update' -> Update data BSTB tanpa menambah baris baru
 * - action: 'delete'          -> Hapus baris BSTB & auto-renumber
 * - default                   -> Simpan data formulir BSTB (DI PALING ATAS / ROW 2)
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

    // =========================================================================
    // 1. HAPUS DATA DARI GOOGLE SPREADSHEET & OTOMATIS URUTKAN NOMOR
    // =========================================================================
    if (data.action === "delete") {
      var noBstbToDelete = (data.noBstb || "").trim();
      var deptToDelete = (data.departemen || "").toLowerCase();
      var deletedRowsCount = 0;
      var sheetNames = deptToDelete === "teknik" ? ["Teknik"] : deptToDelete === "scm" ? ["SCM_Gudang"] : deptToDelete === "produksi" ? ["Produksi"] : ["Teknik", "Produksi", "SCM_Gudang"];

      for (var s = 0; s < sheetNames.length; s++) {
        var sh = ss.getSheetByName(sheetNames[s]);
        if (!sh || sh.getLastRow() <= 1) continue;

        for (var r = sh.getLastRow(); r >= 2; r--) {
          var cellValue = String(sh.getRange(r, 3).getValue()).trim();
          if (cellValue === noBstbToDelete) {
            sh.deleteRow(r);
            deletedRowsCount++;
          }
        }
        // Otomatis urutkan ulang nomor setelah hapus
        renumberSheet(sh);
      }

      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        message: "Data BSTB berhasil dihapus dan nomor diurutkan kembali",
        deletedRows: deletedRowsCount,
        noBstb: noBstbToDelete
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // =========================================================================
    // 2. KIRIM EMAIL KODE RESET PASSWORD (VIA GMAIL NATIVE APPS SCRIPT)
    // =========================================================================
    if (data.action === "sendResetEmail") {
      var targetEmail = String(data.email || "").trim();
      var otpCode = String(data.otpCode || "").trim();

      if (!targetEmail || !otpCode) {
        return ContentService.createTextOutput(JSON.stringify({
          status: "error", message: "Email dan Kode OTP diperlukan"
        })).setMimeType(ContentService.MimeType.JSON);
      }

      var subject = "Kode Verifikasi Reset Password BSTB - PT Mitra Multi Packaging";
      var bodyHtml = '<div style="font-family:Arial,sans-serif;padding:24px;border:1px solid #e2e8f0;border-radius:12px;max-width:480px;background:#ffffff;">' +
        '<h3 style="color:#1d4ed8;margin-top:0;">Reset Password Akun Admin BSTB</h3>' +
        '<p style="color:#334155;font-size:13px;line-height:1.5;">Halo Rekan Admin HCGA,</p>' +
        '<p style="color:#334155;font-size:13px;line-height:1.5;">Berikut adalah kode verifikasi OTP untuk mengatur ulang kata sandi akun Anda:</p>' +
        '<div style="background:#f8fafc;border:2px dashed #3b82f6;padding:16px;border-radius:10px;text-align:center;margin:20px 0;">' +
        '<span style="font-size:28px;font-weight:bold;letter-spacing:6px;color:#1e40af;">' + otpCode + '</span>' +
        '</div>' +
        '<p style="color:#64748b;font-size:12px;">Masukkan kode 6 digit di atas pada menu Lupa Password di aplikasi. Kode berlaku selama 15 menit.</p>' +
        '<hr style="border:none;border-top:1px solid #e2e8f0;margin:20px 0;"/>' +
        '<p style="font-size:11px;color:#94a3b8;margin-bottom:0;">PT Mitra Multi Packaging &bull; Human Capital & General Affairs</p>' +
        '</div>';

      try {
        MailApp.sendEmail({
          to: targetEmail,
          subject: subject,
          htmlBody: bodyHtml
        });
        return ContentService.createTextOutput(JSON.stringify({
          status: "success",
          message: "Email kode verifikasi berhasil dikirim ke: " + targetEmail
        })).setMimeType(ContentService.MimeType.JSON);
      } catch (mailErr) {
        return ContentService.createTextOutput(JSON.stringify({
          status: "error",
          message: "Gagal mengirim email: " + mailErr.toString()
        })).setMimeType(ContentService.MimeType.JSON);
      }
    }

    // =========================================================================
    // 3. DAFTAR / LOGIN DENGAN AKUN GOOGLE
    // =========================================================================
    if (data.action === "googleAuth") {
      var sheetLogin = ss.getSheetByName("Login");
      if (!sheetLogin) { setupSheet(); sheetLogin = ss.getSheetByName("Login"); }

      var gEmail = String(data.email || "").trim().toLowerCase();
      var gName = String(data.nama || data.name || "Admin Google").trim();
      var gUserId = gEmail.split("@")[0] || "admin";
      var isExisting = false;

      if (sheetLogin.getLastRow() > 1) {
        var numRows = sheetLogin.getLastRow() - 1;
        var emailRange = sheetLogin.getRange(2, 4, numRows, 1).getValues();

        for (var ge = 0; ge < emailRange.length; ge++) {
          var rowEmail = String(emailRange[ge][0] || "").trim().toLowerCase();
          if (rowEmail === gEmail) {
            isExisting = true;
            sheetLogin.getRange(ge + 2, 2).setValue(timestampStr); // Update last login time
            sheetLogin.getRange(ge + 2, 8).setValue("Aktif (Google OAuth)");
            break;
          }
        }
      }

      if (!isExisting) {
        var nextNo = Math.max(1, sheetLogin.getLastRow());
        sheetLogin.appendRow([
          nextNo,
          timestampStr,
          gUserId,
          gEmail,
          "Google Sign-In",
          gName,
          "Admin HCGA",
          "Aktif (Google OAuth)"
        ]);
      }

      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        message: "Autentikasi Google berhasil",
        userId: gUserId,
        email: gEmail,
        nama: gName
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // =========================================================================
    // 4. PENDAFTARAN AKUN MANUAL
    // =========================================================================
    if (data.action === "register") {
      var sheetLogin = ss.getSheetByName("Login");
      if (!sheetLogin) { setupSheet(); sheetLogin = ss.getSheetByName("Login"); }

      var nextNo = Math.max(1, sheetLogin.getLastRow());
      sheetLogin.appendRow([
        nextNo,
        timestampStr,
        data.userId || "",
        data.email || "",
        "*****",
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

    // =========================================================================
    // 5. GANTI PASSWORD & RESET PASSWORD
    // =========================================================================
    if (data.action === "changePassword" || data.action === "resetPassword") {
      var sheetLogin = ss.getSheetByName("Login");
      if (!sheetLogin) { setupSheet(); sheetLogin = ss.getSheetByName("Login"); }

      var targetUserId = String(data.userId || "").trim().toLowerCase();
      var targetEmail = String(data.email || "").trim().toLowerCase();
      var isUpdated = false;

      if (sheetLogin.getLastRow() > 1) {
        var numRows = sheetLogin.getLastRow() - 1;
        var usersRange = sheetLogin.getRange(2, 3, numRows, 2).getValues();

        for (var u = 0; u < usersRange.length; u++) {
          var rowUser = String(usersRange[u][0] || "").trim().toLowerCase();
          var rowEmail = String(usersRange[u][1] || "").trim().toLowerCase();

          if ((targetUserId && rowUser === targetUserId) || (targetEmail && rowEmail === targetEmail)) {
            var rowIndex = u + 2;
            sheetLogin.getRange(rowIndex, 2).setValue(timestampStr); // Update Timestamp waktu perubahan
            sheetLogin.getRange(rowIndex, 5).setValue("*****");      // Tampilkan ***** di Google Sheet agar aman
            sheetLogin.getRange(rowIndex, 8).setValue("Aktif (Diperbarui: " + timestampStr + ")");
            isUpdated = true;
            break;
          }
        }
      }

      if (!isUpdated) {
        var nextNo = Math.max(1, sheetLogin.getLastRow());
        sheetLogin.appendRow([
          nextNo,
          timestampStr,
          data.userId || "admin",
          data.email || "",
          "*****",
          data.nama || "Admin HCGA",
          "Admin HCGA",
          "Aktif (Diperbarui: " + timestampStr + ")"
        ]);
      }

      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        message: "Password berhasil diperbarui di Google Sheet",
        userId: data.userId
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // =========================================================================
    // 6. PENYIMPANAN / EDIT DATA BSTB (DATA BARU HARUS DI PALING ATAS - ROW 2)
    // =========================================================================
    var dept = (data.departemen || "").toLowerCase();
    var isTeknik = dept.indexOf("teknik") !== -1 || (data.noDokumen && data.noDokumen.indexOf("TNK") !== -1);
    var isScm = dept.indexOf("scm") !== -1 || dept.indexOf("gudang") !== -1 || (data.noDokumen && data.noDokumen.indexOf("SCH") !== -1);
    var targetSheetName = isTeknik ? "Teknik" : isScm ? "SCM_Gudang" : "Produksi";
    var sheet = ss.getSheetByName(targetSheetName);
    if (!sheet) { setupSheet(); sheet = ss.getSheetByName(targetSheetName); }

    var isEditMode = (data.action === "edit" || data.action === "update");
    var targetNoBstb = (data.noBstb || "").trim();

    // Jika mode edit, hapus data lama dari nomor BSTB tersebut terlebih dahulu
    if (isEditMode && targetNoBstb && sheet.getLastRow() > 1) {
      for (var er = sheet.getLastRow(); er >= 2; er--) {
        var existingNoBstb = String(sheet.getRange(er, 3).getValue()).trim();
        if (existingNoBstb === targetNoBstb) {
          sheet.deleteRow(er);
        }
      }
    }

    var items = data.items || (isTeknik ? data.itemsTeknik : isScm ? (data.itemsScm || []) : data.itemsProduksi) || [];
    var rowsToInsert = [];

    for (var i = 0; i < items.length; i++) {
      var it = items[i];
      var isFirstItem = (rowsToInsert.length === 0);

      if (isTeknik) {
        if (!it.namaBarang && !it.kodeBarang && !it.jumlah) continue;
        rowsToInsert.push([
          isFirstItem ? 1 : "",
          isFirstItem ? timestampStr : "",
          isFirstItem ? (data.noBstb || "") : "",
          isFirstItem ? (data.tanggal || "") : "",
          it.kodeBarang || it.kode || "",
          it.namaBarang || it.nama || "",
          it.jumlah !== undefined && it.jumlah !== "" ? it.jumlah : "",
          it.satuan || "",
          it.beratKg !== undefined && it.beratKg !== "" ? it.beratKg : "",
          it.noFpb || "",
          it.keterangan || ""
        ]);
      } else {
        // Produksi dan SCM
        if (!it.namaItem && !it.kodeItem && !it.qty) continue;
        rowsToInsert.push([
          isFirstItem ? 1 : "",
          isFirstItem ? timestampStr : "",
          isFirstItem ? (data.noBstb || "") : "",
          isFirstItem ? (data.tanggal || "") : "",
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
    }

    if (rowsToInsert.length > 0) {
      var numRows = rowsToInsert.length;

      // SISIPKAN BARIS BARU DI ROW 2 (PALING ATAS, DI BAWAH HEADER)
      sheet.insertRowsBefore(2, numRows);
      sheet.getRange(2, 1, numRows, rowsToInsert[0].length).setValues(rowsToInsert);

      // Jika ada lebih dari 1 item dalam 1 form, merge kolom utama (No, Timestamp, No BSTB, Tanggal)
      if (numRows > 1) {
        var mergeColCount = 4;
        for (var c = 1; c <= mergeColCount; c++) {
          sheet.getRange(2, c, numRows, 1).merge();
        }
        sheet.getRange(2, 1, numRows, mergeColCount).setVerticalAlignment("middle").setHorizontalAlignment("center");
      }

      // OTOMATIS URUTKAN NOMOR (KOLOM A) DARI 1 HINGGA TERAKHIR SECARA SEMPURNA
      renumberSheet(sheet);
    }

    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      action: isEditMode ? "edit" : "insert",
      targetSheet: targetSheetName,
      rowsInserted: rowsToInsert.length,
      noBstb: targetNoBstb
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
`;
