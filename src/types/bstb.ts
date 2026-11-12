export type DepartmentType = 'teknik' | 'produksi' | 'scm';

export interface BSTBItemTeknik {
  id: string;
  kodeBarang: string;
  namaBarang: string;
  jumlah: number | string;
  satuan: string;
  beratKg: number | string;
  noFpb?: string;
  keterangan: string;
}

export interface BSTBItemProduksi {
  id: string;
  kodeItem: string;
  namaItem: string;
  qty: number | string;
  tglMasuk: string;
  batchNo: string;
  satuan: string;
  spk: string;
  keterangan: string;
}

export interface BSTBItemSCM {
  id: string;
  kodeBarang?: string;
  namaBarang: string;
  jumlah: number | string;
  satuan: string;
  jenis: string;
  keterangan: string;
}

export interface BSTBDocument {
  id: string;
  departemen: DepartmentType;
  noBstb: string;
  tanggal: string;
  bagian: string;
  
  // ISO Header fields
  noDokumen: string;
  revisi: string;
  tanggalTerbit: string;
  
  // Table Items
  itemsTeknik: BSTBItemTeknik[];
  itemsProduksi: BSTBItemProduksi[];
  itemsScm?: BSTBItemSCM[];
  
  // Signatures
  signatures: {
    diserahkanOleh: { role: string; name: string };
    diketahuiOleh1: { role: string; name: string }; // SPV / Diketahui 1
    diketahuiOleh2: { role: string; name: string }; // Manager / Diketahui 2
    diterimaOleh: { role: string; name: string };
    diperiksaOleh: { role: string; name: string }; // Produksi
  };
  
  // Time tracking (Dept Produksi)
  timesTime: {
    startTime: string;
    finishTime: string;
  };
  
  createdAt: string;
  updatedAt: string;
}

export const DEPT_DEFAULTS = {
  teknik: {
    noDokumen: 'F - TNK - 027',
    revisi: '0',
    tanggalTerbit: '07 Agustus 2024',
    noBstbPrefix: 'BSTB-TNK',
    sampleNo: '011/BSTB-TNK-/K/2026',
    defaultBagian: 'Maintenance & Utility',
    bagianOptions: [
      'Maintenance & Utility',
      'Workshop Teknik',
      'Sparepart & Tooling',
      'Electrical & Automation',
      'Gudang Sparepart',
      'Proyek & Fabrikasi'
    ],
    satuanOptions: ['Pcs', 'Unit', 'Set', 'Kg', 'Roll', 'Box', 'Meter', 'Batang', 'Lembar', 'Liter']
  },
  produksi: {
    noDokumen: 'F - PRO - 48',
    revisi: '01',
    tanggalTerbit: '17-10-2024',
    noBstbPrefix: 'PRODB3',
    sampleNo: '029/PRODB3/K/2026',
    defaultBagian: 'Printing & Slitting',
    bagianOptions: [
      'Printing (Cetak)',
      'Dry Laminating (Laminasi)',
      'Extrusion Coating',
      'Slitting & Rewinding',
      'Bag Making / Sealing',
      'Gudang Bahan Baku (Raw Material)',
      'Gudang WIP (Work In Process)',
      'Gudang Finished Goods (Barang Jadi)'
    ],
    satuanOptions: ['Roll', 'Kg', 'Meter', 'Pcs', 'Box', 'Pallet', 'Can', 'Drum']
  },
  scm: {
    noDokumen: '',
    revisi: '',
    tanggalTerbit: '',
    noBstbPrefix: 'RM-WH',
    sampleNo: '004/RM-WH/VII/2026',
    defaultBagian: 'SCM',
    bagianOptions: [
      'SCM',
      'Supply Chain Management'
    ],
    satuanOptions: ['Kg', 'KG', 'Pcs', 'Unit', 'Set', 'Box', 'Pallet', 'Roll', 'Can', 'Drum', 'Liter']
  }
};
