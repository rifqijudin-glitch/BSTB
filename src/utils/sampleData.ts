import { BSTBDocument } from '../types/bstb';

export const SAMPLE_BSTB_TEKNIK: BSTBDocument = {
  id: 'bstb-sample-teknik-01',
  departemen: 'teknik',
  noBstb: '011/BSTB-TNK-/K/2026',
  tanggal: '2026-10-28',
  bagian: 'Maintenance & Utility',
  noDokumen: 'F - TNK - 027',
  revisi: '0',
  tanggalTerbit: '07 Agustus 2024',
  itemsTeknik: [
    {
      id: 't-1',
      kodeBarang: 'TNK-BRG-6205',
      namaBarang: 'Deep Groove Ball Bearing 6205-2RS SKF',
      jumlah: 8,
      satuan: 'Pcs',
      beratKg: 1.84,
      keterangan: 'Untuk Roller Nip Mesin Slitter 02'
    },
    {
      id: 't-2',
      kodeBarang: 'TNK-BLT-T10',
      namaBarang: 'Timing Belt T10-1200 Lebar 25mm PU Steel',
      jumlah: 3,
      satuan: 'Pcs',
      beratKg: 0.95,
      keterangan: 'Main Drive Motor Extruder Line 1'
    },
    {
      id: 't-3',
      kodeBarang: 'TNK-HTR-450',
      namaBarang: 'Band Heater Mika 450W / 220V Dia. 120mm',
      jumlah: 6,
      satuan: 'Set',
      beratKg: 2.10,
      keterangan: 'Penggantian Heater Barrel Zone 3'
    },
    {
      id: 't-4',
      kodeBarang: 'TNK-OIL-VG220',
      namaBarang: 'Oli Gearbox Industri Shell Omala S2 G 220',
      jumlah: 1,
      satuan: 'Pail (20L)',
      beratKg: 18.20,
      keterangan: 'Preventive Maintenance Berkala'
    },
    {
      id: 't-5',
      kodeBarang: 'TNK-SNS-PRX',
      namaBarang: 'Inductive Proximity Sensor M12 PNP NO Autonics',
      jumlah: 4,
      satuan: 'Unit',
      beratKg: 0.40,
      keterangan: 'Sensor Pulsa Kecepatan Turret Rewind'
    }
  ],
  itemsProduksi: [],
  signatures: {
    diserahkanOleh: { role: 'Admin', name: 'Budi Santoso' },
    diketahuiOleh1: { role: 'SPV', name: 'Rahmat Hidayat' },
    diketahuiOleh2: { role: 'Manager', name: 'Ir. Hendra Kusuma' },
    diterimaOleh: { role: 'Penerima', name: 'Agus Setiawan' },
    diperiksaOleh: { role: 'QC / Checker', name: '' }
  },
  timesTime: {
    startTime: '',
    finishTime: ''
  },
  createdAt: '2026-10-28T09:15:00.000Z',
  updatedAt: '2026-10-28T09:15:00.000Z'
};

export const SAMPLE_BSTB_PRODUKSI: BSTBDocument = {
  id: 'bstb-sample-prod-02',
  departemen: 'produksi',
  noBstb: '029/PRODB3/K/2026',
  tanggal: '2026-10-30',
  bagian: 'Printing & Slitting',
  noDokumen: 'F - PRO - 48',
  revisi: '01',
  tanggalTerbit: '17-10-2024',
  itemsTeknik: [],
  itemsProduksi: [
    {
      id: 'p-1',
      kodeItem: 'RM-BOPP-20',
      namaItem: 'BOPP Film Plain Corona 20 Micron Lebar 860mm',
      qty: 12,
      tglMasuk: '2026-10-30',
      batchNo: 'B26-10291-A',
      satuan: 'Roll',
      spk: 'SPK/PRN/2026/1089',
      keterangan: 'Job order: Kemasan Wafer Chocolate 80g'
    },
    {
      id: 'p-2',
      kodeItem: 'RM-INK-CYAN',
      namaItem: 'Gravure Printing Ink Poly Cyan Process NT',
      qty: 5,
      tglMasuk: '2026-10-30',
      batchNo: 'INK-2610-88',
      satuan: 'Can (20Kg)',
      spk: 'SPK/PRN/2026/1089',
      keterangan: 'Warna Unit 1 Rotogravure 8 Warna'
    },
    {
      id: 'p-3',
      kodeItem: 'RM-SOLV-EA',
      namaItem: 'Solvent Ethyl Acetate 99.8% Purity',
      qty: 2,
      tglMasuk: '2026-10-30',
      batchNo: 'SLV-EA-0941',
      satuan: 'Drum (200L)',
      spk: 'SPK/PRN/2026/1089',
      keterangan: 'Pelarut tinta & pengatur viskositas'
    },
    {
      id: 'p-4',
      kodeItem: 'WIP-LAM-LLDPE',
      namaItem: 'Film LLDPE Natural Sealing 40 Micron L.850mm',
      qty: 8,
      tglMasuk: '2026-10-30',
      batchNo: 'PE-EXT-8820',
      satuan: 'Roll',
      spk: 'SPK/LAM/2026/0540',
      keterangan: 'Untuk layer laminasi barrier'
    }
  ],
  signatures: {
    diserahkanOleh: { role: 'Admin', name: 'Siti Aminah' },
    diketahuiOleh1: { role: 'SPV', name: 'Kurniawan Pratama' },
    diketahuiOleh2: { role: 'Manager', name: '' },
    diterimaOleh: { role: 'Operator Printing', name: 'Dedi Mulyadi' },
    diperiksaOleh: { role: 'Quality Control', name: 'Wahyu Nugroho' }
  },
  timesTime: {
    startTime: '08:00',
    finishTime: '09:45'
  },
  createdAt: '2026-10-30T08:00:00.000Z',
  updatedAt: '2026-10-30T09:45:00.000Z'
};

// Autocomplete recommendations
export const CATALOG_TEKNIK = [
  { kode: 'TNK-BRG-6205', nama: 'Deep Groove Ball Bearing 6205-2RS SKF', satuan: 'Pcs', berat: 0.23 },
  { kode: 'TNK-BRG-6004', nama: 'Ball Bearing 6004-ZZ NSK High Speed', satuan: 'Pcs', berat: 0.15 },
  { kode: 'TNK-BLT-T10', nama: 'Timing Belt T10-1200 Lebar 25mm PU Steel', satuan: 'Pcs', berat: 0.32 },
  { kode: 'TNK-BLT-5M', nama: 'HTD Synchronous Belt 5M-800 Lebar 15mm', satuan: 'Pcs', berat: 0.18 },
  { kode: 'TNK-HTR-450', nama: 'Band Heater Mika 450W / 220V Dia. 120mm', satuan: 'Set', berat: 0.35 },
  { kode: 'TNK-HTR-CRTG', nama: 'Cartridge Heater 500W Dia 12mm x 150mm', satuan: 'Pcs', berat: 0.12 },
  { kode: 'TNK-OIL-VG220', nama: 'Oli Gearbox Industri Shell Omala S2 G 220', satuan: 'Pail', berat: 18.2 },
  { kode: 'TNK-OIL-ISO68', nama: 'Oli Hidrolik Tellus S2 M 68', satuan: 'Drum', berat: 180.0 },
  { kode: 'TNK-SNS-PRX', nama: 'Inductive Proximity Sensor M12 PNP NO Autonics', satuan: 'Unit', berat: 0.1 },
  { kode: 'TNK-PNEU-CYL', nama: 'Pneumatic Cylinder Festo DSNU-25-100-PPV-A', satuan: 'Unit', berat: 0.85 },
  { kode: 'TNK-SL-TC40', nama: 'Oil Seal TC 40x62x8 NBR Double Lip', satuan: 'Pcs', berat: 0.05 },
  { kode: 'TNK-BLD-CRB', nama: 'Slitter Razor Blade Ceramic Coated 43x22mm', satuan: 'Box (100pcs)', berat: 0.45 }
];

export const CATALOG_PRODUKSI = [
  { kode: 'RM-BOPP-20', nama: 'BOPP Film Plain Corona 20 Micron Lebar 860mm', satuan: 'Roll' },
  { kode: 'RM-BOPP-M-18', nama: 'BOPP Metallized Film High Barrier 18 Micron', satuan: 'Roll' },
  { kode: 'RM-PET-12', nama: 'Polyester PET Film Corona Treated 12 Micron', satuan: 'Roll' },
  { kode: 'RM-LLDPE-40', nama: 'Film LLDPE Natural Sealing 40 Micron L.850mm', satuan: 'Roll' },
  { kode: 'RM-CPP-25', nama: 'Cast Polypropylene (CPP) Retort Grade 25 Mic', satuan: 'Roll' },
  { kode: 'RM-INK-CYAN', nama: 'Gravure Printing Ink Poly Cyan Process NT', satuan: 'Can (20Kg)' },
  { kode: 'RM-INK-MAG', nama: 'Gravure Printing Ink Poly Magenta Process NT', satuan: 'Can (20Kg)' },
  { kode: 'RM-INK-YEL', nama: 'Gravure Printing Ink Poly Yellow Process NT', satuan: 'Can (20Kg)' },
  { kode: 'RM-INK-BLK', nama: 'Gravure Printing Ink Poly Black Process NT', satuan: 'Can (20Kg)' },
  { kode: 'RM-INK-WHT', nama: 'Gravure Printing White Backing Ink High Opacity', satuan: 'Can (20Kg)' },
  { kode: 'RM-SOLV-EA', nama: 'Solvent Ethyl Acetate 99.8% Purity', satuan: 'Drum (200L)' },
  { kode: 'RM-SOLV-IPA', nama: 'Solvent Isopropyl Alcohol (IPA) 99%', satuan: 'Drum (200L)' },
  { kode: 'RM-ADH-PU', nama: 'Polyurethane Laminating Adhesive Solventless', satuan: 'Drum' },
  { kode: 'RM-CORE-3IN', nama: 'Paper Core Tube 3 Inch Panjang 900mm Tebal 8mm', satuan: 'Pcs' }
];
