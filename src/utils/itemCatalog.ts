export interface CatalogItem {
  code: string;
  name: string;
  defaultSatuan?: string;
}

// Master list from Gambar 2 (Waste Type & Waste Code)
export const MASTER_ITEMS_B3: CatalogItem[] = [
  { code: 'A102d', name: 'Aki/ Baterai Bekas', defaultSatuan: 'Pcs' },
  { code: 'A107d', name: 'Pelarut bekas lainnya yang belum dikodifikasi', defaultSatuan: 'Drum' },
  { code: 'A108d', name: 'Limbah Terkontaminasi B3', defaultSatuan: 'Kg' },
  { code: 'A111d', name: 'Refrigerant bekas dari peralatan elektronik', defaultSatuan: 'Can' },
  { code: 'B104d', name: 'Kemasan Bekas Limbah B3', defaultSatuan: 'Pcs' },
  { code: 'B105d', name: 'Minyak Pelumas Bekas', defaultSatuan: 'Drum' },
  { code: 'B107d', name: 'Limbah Elektronik', defaultSatuan: 'Kg' },
  { code: 'B109d', name: 'Filter Bekas', defaultSatuan: 'Pcs' },
  { code: 'B110d', name: 'Kain Majun Bekas dan yang Sejenis', defaultSatuan: 'Kg' },
  { code: 'B353-1', name: 'Cartridge / Toner Bekas', defaultSatuan: 'Pcs' },
  { code: 'B321-1', name: 'Sludge Mengandung Tinta dari Proses Produksi dan Penyimpanannya', defaultSatuan: 'Kg' },
  { code: 'B321-2', name: 'Sludge Tinta', defaultSatuan: 'Kg' },
  { code: 'B321-3', name: 'Residu dari proses pencucian', defaultSatuan: 'Kg' },
  { code: 'B321-4', name: 'Kemasan Bekas Tinta', defaultSatuan: 'Can' },
];

// Satuan options as requested in Item #3
export const SATUAN_OPTIONS = [
  'Kg',
  'Drum',
  'Pcs',
  'Roll',
  'Can',
  'Pallet',
  'Pail',
  'Box',
  'Liter',
  'Unit',
  'Set',
  'Meter'
];

// Department list as requested in Item #1 (from Gambar 1)
export const DEPARTMENT_OPTIONS = [
  { id: 'Produksi', name: 'Produksi', type: 'produksi' as const },
  { id: 'Teknik & IT', name: 'Teknik & IT', type: 'teknik' as const },
  { id: 'FAT', name: 'FAT', type: 'teknik' as const },
  { id: 'HCGA', name: 'HCGA', type: 'teknik' as const },
  { id: 'Manajemen', name: 'Manajemen', type: 'teknik' as const },
  { id: 'Procurement', name: 'Procurement', type: 'teknik' as const },
  { id: 'QA', name: 'QA', type: 'produksi' as const },
  { id: 'RND', name: 'RND', type: 'produksi' as const },
  { id: 'SCM', name: 'SCM', type: 'produksi' as const },
  { id: 'SMO', name: 'SMO', type: 'teknik' as const },
  { id: 'Sales', name: 'Sales', type: 'teknik' as const }
];
