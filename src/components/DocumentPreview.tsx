import React from 'react';
import { BSTBDocument } from '../types/bstb';
import { LogoMMP } from './CompanyLogo';

interface DocumentPreviewProps {
  document?: BSTBDocument;
  doc?: BSTBDocument;
}

export const DocumentPreview: React.FC<DocumentPreviewProps> = ({ document, doc: docProp }) => {
  const doc = document || docProp!;
  if (!doc) return null;
  const isTeknik = doc.departemen === 'teknik';

  // Format date display (DD-MM-YYYY)
  const formatIndoDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        return `${parts[2]}-${parts[1]}-${parts[0]}`;
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  const totalDisplayRows = 10;
  const itemsTeknik = doc.itemsTeknik || [];
  const itemsProduksi = (doc.itemsProduksi && doc.itemsProduksi.length > 0)
    ? doc.itemsProduksi
    : (doc.itemsScm || []).map((s, idx) => ({
        id: s.id || `s-${idx}`,
        kodeItem: s.kodeBarang || s.jenis || '',
        namaItem: s.namaBarang,
        qty: s.jumlah,
        tglMasuk: '',
        batchNo: '',
        satuan: s.satuan,
        spk: '',
        keterangan: s.keterangan
      }));

  if (false as boolean) {
    const itemsScm = doc.itemsScm || [];
    const totalDisplayRowsScm = 6;
    const emptyRowsCount = Math.max(0, totalDisplayRowsScm - itemsScm.length);

    // Calculate total jumlah
    const totalJumlahNum = itemsScm.reduce((acc, it) => {
      const parsed = parseFloat(String(it.jumlah || '0').replace(',', '.'));
      return acc + (isNaN(parsed) ? 0 : parsed);
    }, 0);

    const totalJumlahStr =
      totalJumlahNum === 0 && itemsScm.length === 0
        ? '0'
        : totalJumlahNum % 1 === 0
        ? String(totalJumlahNum)
        : totalJumlahNum.toFixed(2).replace(/\.?0+$/, '').replace('.', ',');

    const primarySatuan = itemsScm[0]?.satuan || 'Kg';

    return (
      <div
        id="printable-bstb-document"
        className="bg-white text-black mx-auto"
        style={{
          width: '190mm',
          minHeight: '265mm',
          padding: '4mm',
          boxSizing: 'border-box',
          fontFamily: "'Arial', 'Helvetica', sans-serif"
        }}
      >
        {/* KOTAK LUAR HITAM PERSIS SESUAI GAMBAR 1 F-SCH-14 */}
        <div
          style={{
            border: '1.5px solid black',
            backgroundColor: '#ffffff'
          }}
        >
          {/* BAGIAN ATAS DENGAN PADDING INTERNAL */}
          <div style={{ padding: '12px 14px 10px 14px' }}>
            {/* 1. JUDUL & NOMOR BSTB (DI TENGAH, TANPA LOGO) */}
            <div style={{ textAlign: 'center', marginBottom: '14px' }}>
              <h1
                style={{
                  margin: 0,
                  fontSize: '20px',
                  fontWeight: 'bold',
                  letterSpacing: '0.5px',
                  textTransform: 'uppercase'
                }}
              >
                BUKTI SERAH TERIMA BARANG
              </h1>
              <div
                style={{
                  fontSize: '15px',
                  fontWeight: 'bold',
                  marginTop: '4px',
                  fontFamily: "'Courier New', Courier, monospace"
                }}
              >
                {doc.noBstb || '004/RM-WH/VII/2024'}
              </div>
            </div>

            {/* 2. SUBHEADER: TGL & BAGIAN (KIRI) vs ISO DOC BOX (KANAN) */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                fontSize: '12px'
              }}
            >
              {/* Bagian Kiri */}
              <div style={{ lineHeight: 1.6 }}>
                <div>
                  <span style={{ display: 'inline-block', width: '60px', fontWeight: 'bold' }}>Tgl</span>
                  <span>: {formatIndoDate(doc.tanggal) || '17-07-2024'}</span>
                </div>
                <div>
                  <span style={{ display: 'inline-block', width: '60px', fontWeight: 'bold' }}>Bagian</span>
                  <span style={{ textTransform: 'uppercase' }}>: {doc.bagian || 'GUDANG'}</span>
                </div>
                <div style={{ marginTop: '2px' }}>
                  Berikut telah kami serahkan barang-barang dengan perincian :
                </div>
              </div>

              {/* Bagian Kanan (Kotak No Doc, Rev, Issue Date) */}
              <div>
                <table
                  style={{
                    borderCollapse: 'collapse',
                    border: '1px solid black',
                    fontSize: '11px',
                    width: '230px'
                  }}
                >
                  <tbody>
                    <tr>
                      <td
                        style={{
                          border: '1px solid black',
                          padding: '2.5px 6px',
                          width: '85px',
                          fontWeight: 'bold'
                        }}
                      >
                        No. Doc.
                      </td>
                      <td
                        style={{
                          border: '1px solid black',
                          padding: '2.5px 6px',
                          fontWeight: 'bold'
                        }}
                      >
                        : {doc.noDokumen || ''}
                      </td>
                    </tr>
                    <tr>
                      <td
                        style={{
                          border: '1px solid black',
                          padding: '2.5px 6px',
                          fontWeight: 'bold'
                        }}
                      >
                        REV.
                      </td>
                      <td
                        style={{
                          border: '1px solid black',
                          padding: '2.5px 6px',
                          fontWeight: 'bold'
                        }}
                      >
                        : {doc.revisi || '1'}
                      </td>
                    </tr>
                    <tr>
                      <td
                        style={{
                          border: '1px solid black',
                          padding: '2.5px 6px',
                          fontWeight: 'bold'
                        }}
                      >
                        Issue Date
                      </td>
                      <td
                        style={{
                          border: '1px solid black',
                          padding: '2.5px 6px',
                          fontWeight: 'bold'
                        }}
                      >
                        : {doc.tanggalTerbit || '20 November 2017'}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* 3. TABEL BARANG (GARIS MENYATU RATA DENGAN BINGKAI KIRI & KANAN) */}
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              borderTop: '1px solid black',
              borderBottom: '1px solid black',
              borderLeft: 'none',
              borderRight: 'none',
              fontSize: '12px'
            }}
          >
            <thead>
              <tr style={{ backgroundColor: '#ffffff' }}>
                <th
                  style={{
                    border: '1px solid black',
                    borderLeft: 'none',
                    padding: '5px 4px',
                    width: '46px',
                    textAlign: 'center',
                    fontWeight: 'bold'
                  }}
                >
                  No.
                </th>
                <th
                  style={{
                    border: '1px solid black',
                    padding: '5px 8px',
                    textAlign: 'center',
                    fontWeight: 'bold'
                  }}
                >
                  Nama Barang
                </th>
                <th
                  style={{
                    border: '1px solid black',
                    padding: '5px 6px',
                    width: '78px',
                    textAlign: 'center',
                    fontWeight: 'bold'
                  }}
                >
                  Jumlah
                </th>
                <th
                  style={{
                    border: '1px solid black',
                    padding: '5px 6px',
                    width: '62px',
                    textAlign: 'center',
                    fontWeight: 'bold'
                  }}
                >
                  Satuan
                </th>
                <th
                  style={{
                    border: '1px solid black',
                    padding: '5px 8px',
                    width: '160px',
                    textAlign: 'center',
                    fontWeight: 'bold',
                    textTransform: 'uppercase'
                  }}
                >
                  JENIS
                </th>
                <th
                  style={{
                    border: '1px solid black',
                    borderRight: 'none',
                    padding: '5px 8px',
                    width: '32%',
                    textAlign: 'center',
                    fontWeight: 'bold'
                  }}
                >
                  Keterangan
                </th>
              </tr>
            </thead>
            <tbody>
              {itemsScm.map((it, idx) => (
                <tr key={it.id || idx}>
                  <td
                    style={{
                      border: '1px solid black',
                      borderLeft: 'none',
                      padding: '4px 3px',
                      textAlign: 'center',
                      verticalAlign: 'middle'
                    }}
                  >
                    {idx + 1}
                  </td>
                  <td
                    style={{
                      border: '1px solid black',
                      padding: '4px 8px',
                      verticalAlign: 'middle',
                      fontWeight: 500
                    }}
                  >
                    {it.namaBarang}
                  </td>
                  <td
                    style={{
                      border: '1px solid black',
                      padding: '4px 6px',
                      textAlign: 'center',
                      verticalAlign: 'middle',
                      fontFamily: "'Courier New', Courier, monospace",
                      fontWeight: 'bold'
                    }}
                  >
                    {it.jumlah}
                  </td>
                  <td
                    style={{
                      border: '1px solid black',
                      padding: '4px 6px',
                      textAlign: 'center',
                      verticalAlign: 'middle'
                    }}
                  >
                    {it.satuan}
                  </td>
                  <td
                    style={{
                      border: '1px solid black',
                      padding: '4px 6px',
                      textAlign: 'center',
                      verticalAlign: 'middle'
                    }}
                  >
                    {it.jenis || it.kodeBarang || ''}
                  </td>
                  <td
                    style={{
                      border: '1px solid black',
                      borderRight: 'none',
                      padding: '4px 8px',
                      verticalAlign: 'middle'
                    }}
                  >
                    {it.keterangan}
                  </td>
                </tr>
              ))}

              {/* Baris Kosong Bergaris Tanpa Angka Nomor - Persis Gambar 1 */}
              {Array.from({ length: emptyRowsCount }).map((_, i) => (
                <tr key={`empty-${i}`}>
                  <td style={{ border: '1px solid black', borderLeft: 'none', height: '22px' }}>&nbsp;</td>
                  <td style={{ border: '1px solid black' }}>&nbsp;</td>
                  <td style={{ border: '1px solid black' }}>&nbsp;</td>
                  <td style={{ border: '1px solid black' }}>&nbsp;</td>
                  <td style={{ border: '1px solid black' }}>&nbsp;</td>
                  <td style={{ border: '1px solid black', borderRight: 'none' }}>&nbsp;</td>
                </tr>
              ))}

              {/* BARIS TOTAL */}
              <tr>
                <td
                  colSpan={2}
                  style={{
                    border: '1px solid black',
                    borderLeft: 'none',
                    padding: '5px 8px',
                    textAlign: 'center',
                    fontWeight: 'bold',
                    letterSpacing: '0.5px'
                  }}
                >
                  TOTAL
                </td>
                <td
                  style={{
                    border: '1px solid black',
                    padding: '5px 6px',
                    textAlign: 'center',
                    fontWeight: 'bold',
                    fontFamily: "'Courier New', Courier, monospace"
                  }}
                >
                  {totalJumlahStr}
                </td>
                <td
                  style={{
                    border: '1px solid black',
                    padding: '5px 6px',
                    textAlign: 'center',
                    fontWeight: 'bold'
                  }}
                >
                  {primarySatuan}
                </td>
                <td style={{ border: '1px solid black' }}>&nbsp;</td>
                <td style={{ border: '1px solid black', borderRight: 'none' }}>&nbsp;</td>
              </tr>
            </tbody>
          </table>

          {/* 4. KOTAK TANDA TANGAN (LEBAR KOLOM DISERAHKAN, DIKETAHUI 1, DITERIMA, DIKETAHUI 2 PERSIS GAMBAR 1) */}
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              borderTop: 'none',
              borderBottom: '1px solid black',
              borderLeft: 'none',
              borderRight: 'none',
              fontSize: '12px'
            }}
          >
            <tbody>
              <tr>
                {/* Kolom 1: Diserahkan oleh (Lebar sama dengan kolom No + Nama Barang) */}
                <td
                  style={{
                    border: '1px solid black',
                    borderLeft: 'none',
                    borderTop: 'none',
                    verticalAlign: 'top',
                    padding: '6px 8px',
                    height: '110px'
                  }}
                >
                  <div style={{ fontWeight: 'normal', marginBottom: '55px' }}>Diserahkan oleh,</div>
                  <div style={{ textAlign: 'center', fontWeight: 'bold' }}>
                    {doc.signatures?.diserahkanOleh?.name ? `( ${doc.signatures.diserahkanOleh.name} )` : ''}
                  </div>
                </td>

                {/* Kolom 2: Diketahui oleh (Lebar mencakup Jumlah + Satuan) */}
                <td
                  style={{
                    border: '1px solid black',
                    borderTop: 'none',
                    width: '140px',
                    verticalAlign: 'top',
                    padding: '6px 8px',
                    height: '110px'
                  }}
                >
                  <div style={{ fontWeight: 'normal', marginBottom: '55px' }}>Diketahui oleh,</div>
                  <div style={{ textAlign: 'center', fontWeight: 'bold' }}>
                    {doc.signatures?.diketahuiOleh1?.name ? `( ${doc.signatures.diketahuiOleh1.name} )` : ''}
                  </div>
                </td>

                {/* Kolom 3: Diterima oleh (Lebar mencakup JENIS) */}
                <td
                  style={{
                    border: '1px solid black',
                    borderTop: 'none',
                    width: '160px',
                    verticalAlign: 'top',
                    padding: '6px 8px',
                    height: '110px'
                  }}
                >
                  <div style={{ fontWeight: 'normal', marginBottom: '55px' }}>Diterima oleh,</div>
                  <div style={{ textAlign: 'center', fontWeight: 'bold' }}>
                    {doc.signatures?.diterimaOleh?.name ? `( ${doc.signatures.diterimaOleh.name} )` : ''}
                  </div>
                </td>

                {/* Kolom 4: Diketahui oleh lagi (Lebar mencakup Keterangan) */}
                <td
                  style={{
                    border: '1px solid black',
                    borderTop: 'none',
                    borderRight: 'none',
                    width: '32%',
                    verticalAlign: 'top',
                    padding: '6px 8px',
                    height: '110px'
                  }}
                >
                  <div style={{ fontWeight: 'normal', marginBottom: '55px' }}>Diketahui oleh,</div>
                  <div style={{ textAlign: 'center', fontWeight: 'bold' }}>
                    {doc.signatures?.diketahuiOleh2?.name ? `( ${doc.signatures.diketahuiOleh2.name} )` : ''}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          {/* 5. KETERANGAN / PETUNJUK BAGIAN BAWAH FORM - LANGSUNG DI DALAM BINGKAI */}
          <div
            style={{
              padding: '6px 14px 6px 14px',
              fontSize: '11px',
              display: 'flex',
              justifyContent: 'flex-start',
              gap: '40px',
              fontWeight: 500,
              backgroundColor: '#ffffff'
            }}
          >
            <span>Lbr putih : Gudang</span>
            <span>Lbr merah : Acct</span>
            <span>Lbr kuning : GA</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      id="printable-bstb-document"
      className="bg-white text-black mx-auto"
      style={{
        width: '190mm',
        minHeight: '265mm',
        padding: '2mm 4mm',
        boxSizing: 'border-box',
        fontFamily: "'Arial', 'Helvetica', sans-serif"
      }}
    >
      {/* ======================================================== */}
      {/* 1. HEADER BOX (SESUAI GAMBAR 23e997cb & 8fe56da2)        */}
      {/* ======================================================== */}
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          border: '1.5px solid black',
          tableLayout: 'fixed',
          fontFamily: "'Arial', 'Helvetica', sans-serif"
        }}
      >
        <colgroup>
          <col style={{ width: '84px' }} />
          <col style={{ width: 'auto' }} />
          <col style={{ width: '92px' }} />
          <col style={{ width: '98px' }} />
        </colgroup>
        <tbody>
          {/* BARIS 1 */}
          <tr>
            {/* KOTAK LOGO BULAT-BULAT (ROWSPAN 3, PAS DAN DI TENGAH KOTAK) */}
            <td
              rowSpan={3}
              style={{
                width: '84px',
                height: '84px',
                border: '1.5px solid black',
                textAlign: 'center',
                verticalAlign: 'middle',
                padding: '2px',
                boxSizing: 'border-box'
              }}
            >
              <div
                style={{
                  width: '80px',
                  height: '80px',
                  margin: '0 auto',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <LogoMMP variant="dots" size={80} />
              </div>
            </td>

            {/* NAMA PERUSAHAAN */}
            <td
              style={{
                border: '1px solid black',
                textAlign: 'center',
                verticalAlign: 'middle',
                padding: '6px 8px'
              }}
            >
              <div style={{ fontSize: '16px', fontWeight: 'bold', letterSpacing: '-0.3px', lineHeight: 1.15 }}>
                mitra multi packaging
              </div>
              <div style={{ fontSize: '8.5px', textTransform: 'uppercase', letterSpacing: '0.8px', color: '#333', marginTop: '2px' }}>
                Flexible Packaging Manufacturer
              </div>
            </td>

            {/* NO DOKUMEN LABEL & VALUE */}
            <td style={{ border: '1px solid black', padding: '3px 5px', fontWeight: 600, fontSize: '10.5px', verticalAlign: 'middle' }}>
              No Dokumen:
            </td>
            <td style={{ border: '1px solid black', padding: '3px 5px', fontWeight: 'bold', fontSize: '11px', verticalAlign: 'middle' }}>
              {doc.noDokumen}
            </td>
          </tr>

          {/* BARIS 2 */}
          <tr>
            {/* FORM */}
            <td
              style={{
                border: '1px solid black',
                textAlign: 'center',
                verticalAlign: 'middle',
                fontWeight: 'bold',
                fontSize: '11.5px',
                padding: '2px'
              }}
            >
              FORM
            </td>

            {/* REVISI LABEL & VALUE */}
            <td style={{ border: '1px solid black', padding: '2px 5px', fontWeight: 600, fontSize: '10.5px', verticalAlign: 'middle' }}>
              Revisi
            </td>
            <td style={{ border: '1px solid black', padding: '2px 5px', fontWeight: 'bold', fontSize: '11px', verticalAlign: 'middle' }}>
              {doc.revisi}
            </td>
          </tr>

          {/* BARIS 3 */}
          <tr>
            {/* BUKTI SERAH TERIMA BARANG */}
            <td
              style={{
                border: '1px solid black',
                textAlign: 'center',
                verticalAlign: 'middle',
                fontWeight: 'bold',
                fontSize: '12px',
                letterSpacing: '0.2px',
                textTransform: 'uppercase',
                padding: '3px'
              }}
            >
              BUKTI SERAH TERIMA BARANG
            </td>

            {/* TANGGAL TERBIT LABEL & VALUE */}
            <td style={{ border: '1px solid black', padding: '2px 5px', fontWeight: 600, fontSize: '10.5px', verticalAlign: 'middle' }}>
              Tanggal Terbit
            </td>
            <td style={{ border: '1px solid black', padding: '2px 5px', fontWeight: 'bold', fontSize: '10px', verticalAlign: 'middle' }}>
              {doc.tanggalTerbit}
            </td>
          </tr>
        </tbody>
      </table>

      {/* ======================================================== */}
      {/* 2. NOMOR BSTB (DI LUAR TABEL & GARIS, CENTERED)          */}
      {/* ======================================================== */}
      <div
        style={{
          textAlign: 'center',
          fontWeight: 'bold',
          fontFamily: 'monospace',
          fontSize: '11.5px',
          marginTop: '4px',
          marginBottom: '8px'
        }}
      >
        {doc.noBstb || (isTeknik ? '011/BSTB-TNK-/K/2026' : '029/PRODB3/K/2026')}
      </div>

      {/* ======================================================== */}
      {/* 3. TANGGAL & BAGIAN (RATA KIRI, POLOS TANPA GARIS KOTAK)  */}
      {/* ======================================================== */}
      <div style={{ fontSize: '11px', lineHeight: 1.35, marginBottom: '6px' }}>
        <div style={{ display: 'flex', marginBottom: '2px' }}>
          <span style={{ width: '65px' }}>Tanggal</span>
          <span style={{ marginRight: '6px' }}>:</span>
          <span>{formatIndoDate(doc.tanggal)}</span>
        </div>
        <div style={{ display: 'flex', marginBottom: '2px' }}>
          <span style={{ width: '65px' }}>Bagian</span>
          <span style={{ marginRight: '6px' }}>:</span>
          <span>{doc.bagian}</span>
        </div>

        {(isTeknik || doc.departemen === 'scm') && (
          <div style={{ marginTop: '4px', marginBottom: '2px', fontWeight: doc.departemen === 'scm' ? 600 : 400 }}>
            Berikut telah kami serahkan barang-barang dengan perincian :
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* 4. MAIN TABLE (TEKNIK VS PRODUKSI)                       */}
      {/* ======================================================== */}
      {isTeknik ? (
        /* ================= TABEL TEKNIK (GAMBAR 3) ================= */
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            border: '1.5px solid black',
            fontSize: '11px'
          }}
        >
          <colgroup>
            <col style={{ width: '5%' }} />
            <col style={{ width: '16%' }} />
            <col style={{ width: '31%' }} />
            <col style={{ width: '8%' }} />
            <col style={{ width: '8%' }} />
            <col style={{ width: '9%' }} />
            <col style={{ width: '11%' }} />
            <col style={{ width: '12%' }} />
          </colgroup>
          <thead>
            <tr style={{ borderBottom: '1.5px solid black', textAlign: 'center', fontWeight: 'bold' }}>
              <th style={{ border: '1px solid black', padding: '3px 2px' }}>No</th>
              <th style={{ border: '1px solid black', padding: '3px 4px' }}>Kode Barang</th>
              <th style={{ border: '1px solid black', padding: '3px 6px' }}>Nama Barang</th>
              <th style={{ border: '1px solid black', padding: '3px 2px' }}>Jumlah</th>
              <th style={{ border: '1px solid black', padding: '3px 2px' }}>Satuan</th>
              <th style={{ border: '1px solid black', padding: '2px' }}>
                <div>Berat</div>
                <div>(Kg)</div>
              </th>
              <th style={{ border: '1px solid black', padding: '3px 4px' }}>No. FPB</th>
              <th style={{ border: '1px solid black', padding: '3px 4px' }}>Keterangan</th>
            </tr>
          </thead>
          <tbody>
            {/* 10 DATA ROWS */}
            {Array.from({ length: totalDisplayRows }).map((_, index) => {
              const item = itemsTeknik[index];
              return (
                <tr key={`t-row-${index}`} style={{ height: '26px' }}>
                  <td style={{ border: '1px solid black', textAlign: 'center', padding: '2px' }}>
                    {item ? index + 1 : ''}
                  </td>
                  <td style={{ border: '1px solid black', padding: '2px 4px', fontFamily: 'monospace', fontSize: '10px' }}>
                    {item?.kodeBarang || ''}
                  </td>
                  <td style={{ border: '1px solid black', padding: '2px 6px' }}>
                    {item?.namaBarang || ''}
                  </td>
                  <td style={{ border: '1px solid black', textAlign: 'center', padding: '2px' }}>
                    {item?.jumlah !== undefined && item?.jumlah !== '' ? item.jumlah : ''}
                  </td>
                  <td style={{ border: '1px solid black', textAlign: 'center', padding: '2px' }}>
                    {item?.satuan || ''}
                  </td>
                  <td style={{ border: '1px solid black', textAlign: 'center', padding: '2px', fontFamily: 'monospace' }}>
                    {item?.beratKg !== undefined && item?.beratKg !== '' ? item.beratKg : ''}
                  </td>
                  <td style={{ border: '1px solid black', padding: '2px 4px', fontSize: '10px' }}>
                    {item?.noFpb || ''}
                  </td>
                  <td style={{ border: '1px solid black', padding: '2px 4px', fontSize: '10px' }}>
                    {item?.keterangan || ''}
                  </td>
                </tr>
              );
            })}

            {/* FOOTER ROW 1: LABELS (TANPA GARIS PEMBATAS KE NAMA DI BAWAH) */}
            <tr style={{ height: '24px' }}>
              <td colSpan={3} style={{ border: '1px solid black', borderBottom: 'none', textAlign: 'center', padding: '4px 3px', fontSize: '11px' }}>
                Diserahkan oleh
              </td>
              <td colSpan={3} style={{ border: '1px solid black', borderBottom: 'none', textAlign: 'center', padding: '4px 3px', fontSize: '11px' }}>
                Diketahui oleh
              </td>
              <td colSpan={2} style={{ border: '1px solid black', borderBottom: 'none', textAlign: 'center', padding: '4px 3px', fontSize: '11px' }}>
                Diterima oleh
              </td>
            </tr>

            {/* FOOTER ROW 2: KOTAK BESAR TANDA TANGAN (TANPA GARIS ATAS KE LABEL) */}
            <tr style={{ height: '76px' }}>
              <td colSpan={3} style={{ border: '1px solid black', borderTop: 'none', verticalAlign: 'bottom', textAlign: 'center', paddingBottom: '8px' }}>
                ( {doc.signatures.diserahkanOleh.name || 'Admin'} )
              </td>
              <td colSpan={3} style={{ border: '1px solid black', borderTop: 'none', verticalAlign: 'bottom', paddingBottom: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-around', fontSize: '10.5px' }}>
                  <span>( {doc.signatures.diketahuiOleh1.name || 'SPV'} )</span>
                  <span>( {doc.signatures.diketahuiOleh2?.name || 'Manager'} )</span>
                </div>
              </td>
              <td colSpan={2} style={{ border: '1px solid black', borderTop: 'none', verticalAlign: 'bottom', textAlign: 'center', paddingBottom: '8px' }}>
                ( {doc.signatures.diterimaOleh.name || '            '} )
              </td>
            </tr>
          </tbody>
        </table>
      ) : (
        /* ================= TABEL PRODUKSI (GAMBAR 4) ================= */
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            border: '1.5px solid black',
            fontSize: '10.5px'
          }}
        >
          <colgroup>
            <col style={{ width: '5%' }} />
            <col style={{ width: '14%' }} />
            <col style={{ width: '26%' }} />
            <col style={{ width: '6%' }} />
            <col style={{ width: '11%' }} />
            <col style={{ width: '11%' }} />
            <col style={{ width: '7%' }} />
            <col style={{ width: '9%' }} />
            <col style={{ width: '11%' }} />
          </colgroup>
          <thead>
            <tr style={{ borderBottom: '1.5px solid black', textAlign: 'center', fontWeight: 'bold' }}>
              <th style={{ border: '1px solid black', padding: '3px 1px' }}>No</th>
              <th style={{ border: '1px solid black', padding: '3px 2px' }}>KODE ITEM</th>
              <th style={{ border: '1px solid black', padding: '3px 4px' }}>NAMA ITEM</th>
              <th style={{ border: '1px solid black', padding: '3px 2px' }}>QTY</th>
              <th style={{ border: '1px solid black', padding: '3px 2px' }}>TGL MASUK</th>
              <th style={{ border: '1px solid black', padding: '3px 2px' }}>BATCH #</th>
              <th style={{ border: '1px solid black', padding: '3px 2px' }}>SATUAN</th>
              <th style={{ border: '1px solid black', padding: '3px 2px' }}>SPK</th>
              <th style={{ border: '1px solid black', padding: '3px 4px' }}>Keterangan</th>
            </tr>
          </thead>
          <tbody>
            {/* 10 DATA ROWS */}
            {Array.from({ length: totalDisplayRows }).map((_, index) => {
              const item = itemsProduksi[index];
              return (
                <tr key={`p-row-${index}`} style={{ height: '26px' }}>
                  <td style={{ border: '1px solid black', textAlign: 'center', padding: '1px' }}>
                    {item ? index + 1 : ''}
                  </td>
                  <td style={{ border: '1px solid black', padding: '2px', fontFamily: 'monospace', fontSize: '9.5px' }}>
                    {item?.kodeItem || ''}
                  </td>
                  <td style={{ border: '1px solid black', padding: '2px 4px', fontSize: '10px' }}>
                    {item?.namaItem || ''}
                  </td>
                  <td style={{ border: '1px solid black', textAlign: 'center', padding: '1px' }}>
                    {item?.qty !== undefined && item?.qty !== '' ? item.qty : ''}
                  </td>
                  <td style={{ border: '1px solid black', textAlign: 'center', padding: '1px', fontSize: '9.5px' }}>
                    {item?.tglMasuk || ''}
                  </td>
                  <td style={{ border: '1px solid black', textAlign: 'center', padding: '1px', fontFamily: 'monospace', fontSize: '9.5px' }}>
                    {item?.batchNo || ''}
                  </td>
                  <td style={{ border: '1px solid black', textAlign: 'center', padding: '1px' }}>
                    {item?.satuan || ''}
                  </td>
                  <td style={{ border: '1px solid black', textAlign: 'center', padding: '1px', fontFamily: 'monospace', fontSize: '9.5px' }}>
                    {item?.spk || ''}
                  </td>
                  <td style={{ border: '1px solid black', padding: '2px 3px', fontSize: '9.5px' }}>
                    {item?.keterangan || ''}
                  </td>
                </tr>
              );
            })}

            {/* FOOTER ROW 1: LABELS (TANPA GARIS PEMBATAS KE NAMA DI BAWAH) */}
            <tr style={{ height: '24px' }}>
              <td colSpan={2} style={{ border: '1px solid black', borderBottom: 'none', textAlign: 'center', fontSize: '10px', padding: '3px 2px' }}>
                Diserahkan oleh
              </td>
              <td style={{ border: '1px solid black', borderBottom: 'none', textAlign: 'center', fontSize: '10px', padding: '3px 2px' }}>
                Diketahui oleh
              </td>
              <td colSpan={2} style={{ border: '1px solid black', borderBottom: 'none', textAlign: 'center', fontSize: '10px', padding: '3px 2px' }}>
                Diterima oleh
              </td>
              <td colSpan={2} style={{ border: '1px solid black', borderBottom: 'none', textAlign: 'center', fontSize: '10px', padding: '3px 2px' }}>
                Diperiksa oleh
              </td>

              {/* START TIME CELL */}
              <td colSpan={2} style={{ border: '1px solid black', padding: 0 }}>
                <div style={{ display: 'flex', height: '100%', alignItems: 'center' }}>
                  <span style={{ width: '45px', borderRight: '1px solid black', padding: '2px 4px', fontSize: '10px', fontWeight: 600 }}>
                    Start
                  </span>
                  <span style={{ padding: '2px 4px', fontSize: '10px', fontFamily: 'monospace' }}>
                    {doc.timesTime.startTime || 'Times time'}
                  </span>
                </div>
              </td>
            </tr>

            {/* FOOTER ROW 2: KOTAK BESAR TANDA TANGAN & FINISH TIME (TANPA GARIS ATAS KE LABEL) */}
            <tr style={{ height: '76px' }}>
              <td colSpan={2} style={{ border: '1px solid black', borderTop: 'none', verticalAlign: 'bottom', textAlign: 'center', paddingBottom: '6px', fontSize: '10px' }}>
                ( {doc.signatures.diserahkanOleh.name || 'Admin'} )
              </td>
              <td style={{ border: '1px solid black', borderTop: 'none', verticalAlign: 'bottom', textAlign: 'center', paddingBottom: '6px', fontSize: '10px' }}>
                ( {doc.signatures.diketahuiOleh1.name || 'SPV'} )
              </td>
              <td colSpan={2} style={{ border: '1px solid black', borderTop: 'none', verticalAlign: 'bottom', textAlign: 'center', paddingBottom: '6px', fontSize: '10px' }}>
                ( {doc.signatures.diterimaOleh.name || '         '} )
              </td>
              <td colSpan={2} style={{ border: '1px solid black', borderTop: 'none', verticalAlign: 'bottom', textAlign: 'center', paddingBottom: '6px', fontSize: '10px' }}>
                ( {doc.signatures.diperiksaOleh?.name || '         '} )
              </td>

              {/* FINISH TIME BOX (TOP) + BLANK (BOTTOM) */}
              <td colSpan={2} style={{ border: '1px solid black', verticalAlign: 'top', padding: 0 }}>
                <div style={{ display: 'flex', borderBottom: '1px solid black', height: '22px', alignItems: 'center' }}>
                  <span style={{ width: '45px', borderRight: '1px solid black', padding: '2px 4px', fontSize: '10px', fontWeight: 600 }}>
                    Finish
                  </span>
                  <span style={{ padding: '2px 4px', fontSize: '10px', fontFamily: 'monospace' }}>
                    {doc.timesTime.finishTime || 'Times time'}
                  </span>
                </div>
                <div style={{ height: '54px' }}>
                  &nbsp;
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      )}
    </div>
  );
};
