"use client";

import { useState, useEffect } from "react";
import { collection, getDocs, query, orderBy, deleteDoc, doc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { db, auth } from "@/lib/firebase";
import Link from "next/link";

type Book = {
  id: string;
  no: string;
  sku: string;
  title: string;
  loc: string;
  kategori: string;
  lemari?: string;
  rak?: string;
  year?: string;
  keterangan?: string;
};

export default function DashboardOverview() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const fetchBooks = async () => {
    try {
      const q = query(collection(db, "books"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Book[];
      setBooks(data);
    } catch (error) {
      console.error("Error fetching books: ", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchBooks();
      }
    });
    return () => unsubscribe();
  }, []);

  const handleDelete = async (id: string, title: string) => {
    const confirmed = window.confirm(`Apakah Anda yakin ingin menghapus arsip "${title}"?\n\nTindakan ini tidak dapat dibatalkan.`);
    if (!confirmed) return;

    setDeletingId(id);
    try {
      await deleteDoc(doc(db, "books", id));
      setBooks(prev => prev.filter(b => b.id !== id));
    } catch (error) {
      console.error("Error deleting document:", error);
      alert("Gagal menghapus data. Silakan coba lagi.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleExport = () => {
    const headers = ["No", "No. Buku/SKU", "Judul", "Kategori", "Lokasi", "Lemari", "Rak", "Tahun", "Keterangan"];
    
    // If there is a search query, export filtered results, otherwise export all
    const dataToExport = searchQuery.trim() !== "" 
      ? books.filter(b => {
          const q = searchQuery.toLowerCase();
          return (b.title?.toLowerCase().includes(q)) || (b.sku?.toLowerCase().includes(q)) || (b.no?.toLowerCase().includes(q)) || (b.loc?.toLowerCase().includes(q));
        })
      : books;

    const rows = dataToExport.map((b, i) => [
      i + 1,
      b.sku || b.no || "",
      b.title || "",
      b.kategori || "",
      b.loc || "",
      b.lemari || "",
      b.rak || "",
      b.year || "",
      b.keterangan || ""
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(e => e.map(field => `"${String(field).replace(/"/g, '""')}"`).join(","))
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    const dateStr = new Date().toISOString().split('T')[0];
    link.setAttribute("download", `Data_Arsip_Lakespra_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter mb-6">
        {/* Stat Card 1 */}
        <div className="bg-surface-container-lowest border border-border-muted p-6 rounded-lg flex items-center justify-between">
          <div>
            <p className="font-label-md text-label-md text-text-secondary mb-1">Total Buku</p>
            <h2 className="font-display-lg text-display-lg text-primary">
              {loading ? "..." : books.length}
            </h2>
          </div>
          <div className="w-14 h-14 bg-primary/5 rounded-full flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-3xl">menu_book</span>
          </div>
        </div>
        
        {/* Stat Card 2 */}
        <div className="bg-surface-container-lowest border border-border-muted p-6 rounded-lg flex items-center justify-between">
          <div>
            <p className="font-label-md text-label-md text-text-secondary mb-1">Total Kategori</p>
            <h2 className="font-display-lg text-display-lg text-primary">
              {loading ? "..." : new Set(books.map(b => b.kategori)).size}
            </h2>
          </div>
          <div className="w-14 h-14 bg-secondary/5 rounded-full flex items-center justify-center text-secondary">
            <span className="material-symbols-outlined text-3xl">category</span>
          </div>
        </div>
      </div>

      {/* Action Bar & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="relative max-w-md w-full">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-text-secondary">search</span>
          <input 
            className="w-full pl-10 pr-4 py-2 bg-white border border-border-muted rounded-lg focus:ring-2 focus:ring-on-secondary-container/20 focus:border-on-secondary-container outline-none transition-all font-body-md text-body-md" 
            placeholder="Cari nomor buku, judul, atau lokasi..." 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleExport}
            className="inline-flex items-center justify-center gap-2 px-5 py-2 bg-surface-container-low border border-border-muted text-text-primary rounded-[4px] font-label-md text-label-md hover:bg-surface-container transition-all active:scale-95 shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            Export CSV
          </button>
          <Link href="/dashboard/input-dokumen" className="inline-flex items-center justify-center gap-2 px-6 py-2 bg-on-primary-fixed text-on-primary rounded-[4px] font-label-md text-label-md hover:bg-primary transition-all active:scale-95 shadow-sm">
            <span className="material-symbols-outlined text-[20px]">add</span>
            Tambah Data
          </Link>
        </div>
      </div>

      {/* Data Table Section */}
      <div className="bg-surface-container-lowest border border-border-muted rounded-lg overflow-hidden flex-1 flex flex-col min-h-0">
        <div className="overflow-x-auto relative min-h-[200px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-border-muted">
                <th className="px-6 py-4 font-label-md text-label-md text-text-primary uppercase tracking-wider">No</th>
                <th className="px-6 py-4 font-label-md text-label-md text-text-primary uppercase tracking-wider">No. Buku</th>
                <th className="px-6 py-4 font-label-md text-label-md text-text-primary uppercase tracking-wider">Judul</th>
                <th className="px-6 py-4 font-label-md text-label-md text-text-primary uppercase tracking-wider">Lokasi Fisik</th>
                <th className="px-6 py-4 font-label-md text-label-md text-text-primary uppercase tracking-wider text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-muted">
              {(() => {
                const filtered = books.filter(b => {
                  if (!searchQuery.trim()) return true;
                  const q = searchQuery.toLowerCase();
                  return (b.title?.toLowerCase().includes(q)) || (b.sku?.toLowerCase().includes(q)) || (b.no?.toLowerCase().includes(q)) || (b.loc?.toLowerCase().includes(q));
                });
                if (loading) {
                  return [...Array(5)].map((_, i) => (
                    <tr key={`skeleton-${i}`} className="animate-pulse">
                      <td className="px-6 py-4"><div className="h-4 w-6 bg-surface-container rounded"></div></td>
                      <td className="px-6 py-4"><div className="h-4 w-24 bg-surface-container rounded"></div></td>
                      <td className="px-6 py-4"><div className="h-4 w-48 bg-surface-container rounded"></div></td>
                      <td className="px-6 py-4"><div className="h-6 w-32 bg-surface-container rounded"></div></td>
                      <td className="px-6 py-4 text-right"><div className="h-6 w-16 bg-surface-container rounded ml-auto"></div></td>
                    </tr>
                  ));
                }

                if (filtered.length === 0) return (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-text-secondary">
                      {searchQuery ? "Tidak ada data yang cocok dengan pencarian." : "Belum ada data arsip. Silakan tambah data baru."}
                    </td>
                  </tr>
                );
                
                const totalPages = Math.ceil(filtered.length / itemsPerPage);
                const startIndex = (currentPage - 1) * itemsPerPage;
                const paginatedData = filtered.slice(startIndex, startIndex + itemsPerPage);

                return paginatedData.map((row, i) => (
                  <tr key={row.id} className={`hover:bg-surface-container-low transition-colors group ${deletingId === row.id ? 'opacity-40' : ''}`}>
                    <td className="px-6 py-4 font-body-md text-body-md text-text-primary">{startIndex + i + 1}</td>
                    <td className="px-6 py-4 font-code-sm text-code-sm text-primary uppercase">{row.sku || row.no}</td>
                    <td className="px-6 py-4 font-body-md text-body-md text-text-primary font-medium">{row.title}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-surface-container rounded font-code-sm text-code-sm text-text-secondary border border-border-muted">{row.loc}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link 
                          href={`/dashboard/cetak-label/${row.id}`}
                          target="_blank"
                          className="text-text-secondary hover:text-primary p-1 transition-colors"
                          title="Cetak Label QR"
                        >
                          <span className="material-symbols-outlined text-[20px]">print</span>
                        </Link>
                        <Link 
                          href={`/dashboard/edit-dokumen/${row.id}`}
                          className="text-text-secondary hover:text-secondary p-1 transition-colors"
                          title="Edit data"
                        >
                          <span className="material-symbols-outlined text-[20px]">edit</span>
                        </Link>
                        <button 
                          onClick={() => handleDelete(row.id, row.title)}
                          disabled={deletingId === row.id}
                          className="text-text-secondary hover:text-danger p-1 transition-colors disabled:opacity-50"
                          title="Hapus data"
                        >
                          <span className="material-symbols-outlined text-[20px]">
                            {deletingId === row.id ? "sync" : "delete"}
                          </span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              })()}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {(() => {
          const filtered = books.filter(b => {
            if (!searchQuery.trim()) return true;
            const q = searchQuery.toLowerCase();
            return (b.title?.toLowerCase().includes(q)) || (b.sku?.toLowerCase().includes(q)) || (b.no?.toLowerCase().includes(q)) || (b.loc?.toLowerCase().includes(q));
          });
          const totalPages = Math.ceil(filtered.length / itemsPerPage);
          const startIndex = (currentPage - 1) * itemsPerPage;
          const endIndex = Math.min(startIndex + itemsPerPage, filtered.length);

          if (filtered.length === 0) return null;

          return (
            <div className="px-6 py-4 bg-surface-container-low border-t border-border-muted flex flex-col md:flex-row justify-between items-center gap-4 mt-auto">
              <span className="font-label-md text-label-md text-text-secondary">
                Menampilkan {startIndex + 1} sampai {endIndex} dari {filtered.length} data
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="w-8 h-8 flex items-center justify-center rounded border border-border-muted bg-white text-text-secondary hover:bg-surface-container disabled:opacity-50 transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                </button>
                <span className="font-label-md text-label-md text-text-primary px-2">
                  Halaman {currentPage} dari {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="w-8 h-8 flex items-center justify-center rounded border border-border-muted bg-white text-text-secondary hover:bg-surface-container disabled:opacity-50 transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                </button>
              </div>
            </div>
          );
        })()}
      </div>
    </>
  );
}
