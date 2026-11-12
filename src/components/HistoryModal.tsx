import React from 'react';
import { BSTBDocument } from '../types/bstb';
import { Wrench, Factory, Trash2, ArrowRight, Calendar, Hash, FolderOpen } from 'lucide-react';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedDocuments: BSTBDocument[];
  onLoadDocument: (doc: BSTBDocument) => void;
  onDeleteDocument: (id: string) => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  savedDocuments,
  onLoadDocument,
  onDeleteDocument
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-neutral-200 max-w-2xl w-full p-5 max-h-[85vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
          <div className="flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-bold text-neutral-900">
              Riwayat Arsip Dokumen BSTB
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-700 font-bold p-1 text-base leading-none"
          >
            ✕
          </button>
        </div>

        <p className="text-xs text-neutral-500 py-2.5">
          Daftar dokumen BSTB tersimpan di penyimpanan lokal browser. Anda dapat memuat kembali untuk dicetak atau diekspor ke Excel.
        </p>

        <div className="overflow-y-auto space-y-2.5 my-2 pr-1 flex-1">
          {savedDocuments.length === 0 ? (
            <div className="text-center py-12 text-neutral-400">
              <p className="text-sm">Belum ada dokumen tersimpan di riwayat.</p>
              <p className="text-xs mt-1">Gunakan tombol &quot;Simpan Dokumen&quot; pada toolbar untuk mengarsipkan.</p>
            </div>
          ) : (
            savedDocuments.map((doc) => {
              const isTeknik = doc.departemen === 'teknik';
              const itemCount = isTeknik ? doc.itemsTeknik.length : doc.itemsProduksi.length;

              return (
                <div
                  key={doc.id}
                  className="p-3.5 rounded-xl border border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50/70 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase flex items-center gap-1 ${
                          isTeknik
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {isTeknik ? <Wrench className="w-3 h-3" /> : <Factory className="w-3 h-3" />}
                        {isTeknik ? 'Dept. Teknik' : 'Dept. Produksi'}
                      </span>
                      <span className="font-mono text-xs font-bold text-neutral-900">
                        {doc.noBstb || 'Tanpa Nomor'}
                      </span>
                      <span className="text-[10px] text-neutral-400 font-mono">
                        ({doc.noDokumen})
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 text-xs text-neutral-600">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-neutral-400" />
                        {doc.tanggal || '-'}
                      </span>
                      <span>•</span>
                      <span>Bagian: <strong>{doc.bagian || '-'}</strong></span>
                      <span>•</span>
                      <span>{itemCount} Barang</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => {
                        onLoadDocument(doc);
                        onClose();
                      }}
                      className="px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors flex items-center gap-1 border border-indigo-200"
                    >
                      <span>Buka Form</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteDocument(doc.id)}
                      title="Hapus dari arsip"
                      className="p-1.5 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="pt-3 border-t border-neutral-200 flex justify-between items-center">
          <span className="text-xs text-neutral-500">
            Total {savedDocuments.length} dokumen tersimpan
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
