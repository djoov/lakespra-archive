"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { db, auth } from "@/lib/firebase";
import { AuthGuard } from "@/components/AuthGuard";

type Book = {
  id: string;
  no: string;
  sku: string;
  title: string;
  loc: string;
  lemari: string;
  rak: string;
  kategori: string;
  year: string;
};

export default function PencarianPublik() {
  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [categories, setCategories] = useState<{id: string, name: string}[]>([]);
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) return;

      const fetchBooks = async () => {
        try {
          const q = query(collection(db, "books"), orderBy("createdAt", "desc"));
          const snapshot = await getDocs(q);
          const data = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Book[];
          setBooks(data);
          setFilteredBooks(data);
        } catch (error) {
          console.error("Error fetching books: ", error);
        } finally {
          setLoading(false);
        }
      };
      
      const fetchCats = async () => {
        try {
          const q = query(collection(db, "categories"), orderBy("name", "asc"));
          const snapshot = await getDocs(q);
          setCategories(snapshot.docs.map(doc => ({ id: doc.id, name: doc.data().name })));
        } catch (error) {
          console.error("Error fetching categories: ", error);
        }
      };

      fetchBooks();
      fetchCats();
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    let result = books;
    if (activeCategory !== "Semua") {
      result = result.filter(b => b.kategori === activeCategory);
    }
    if (searchQuery.trim() !== "") {
      const lowerQ = searchQuery.toLowerCase();
      result = result.filter(b => 
        (b.title && b.title.toLowerCase().includes(lowerQ)) || 
        (b.no && b.no.toLowerCase().includes(lowerQ)) ||
        (b.sku && b.sku.toLowerCase().includes(lowerQ))
      );
    }
    setFilteredBooks(result);
    setCurrentPage(1); // Reset page on filter change
  }, [searchQuery, activeCategory, books]);

  const catNames = ["Semua", ...categories.map(c => c.name)];

  return (
    <AuthGuard>
    <div className="min-h-screen bg-surface text-text-primary antialiased relative overflow-hidden font-sans">
      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary-container/20 rounded-full mix-blend-multiply filter blur-[100px] opacity-70 animate-blob"></div>
        <div className="absolute top-[20%] right-[-5%] w-[40%] h-[40%] bg-secondary-container/20 rounded-full mix-blend-multiply filter blur-[100px] opacity-60 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-[-10%] left-[20%] w-[40%] h-[40%] bg-tertiary-container/10 rounded-full mix-blend-multiply filter blur-[100px] opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      {/* Top Navigation */}
      <header className="relative z-50 flex justify-between items-center px-6 md:px-10 py-4 bg-white/70 backdrop-blur-md border-b border-white/40 shadow-[0_2px_10px_rgb(0,0,0,0.02)] sticky top-0">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Lakespra Logo" className="w-9 h-9 object-contain" />
          <span className="font-display text-[18px] font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent hidden sm:block tracking-tight">
            Lakespra Archive
          </span>
        </div>
        <div className="flex items-center gap-5">
          <Link href="/dashboard" className="text-text-secondary hover:text-primary transition-colors text-sm font-medium hidden sm:block">
            Dashboard Admin
          </Link>
          <button 
            onClick={() => signOut(auth)}
            className="px-5 py-2 bg-danger/10 backdrop-blur-sm border border-danger/10 rounded-full text-[13px] font-semibold text-danger hover:bg-danger hover:text-white transition-all duration-300"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Hero Search Section */}
      <section className="relative z-10 pt-16 pb-12 px-6 md:px-10 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/60 backdrop-blur-md text-primary rounded-full mb-6 border border-white/60 shadow-sm">
          <span className="material-symbols-outlined text-[14px] text-secondary">verified</span>
          <span className="text-[11px] uppercase tracking-wider font-bold">Arsip Kesehatan Penerbangan</span>
        </div>
        
        <h1 className="font-display text-4xl md:text-5xl lg:text-[56px] font-extrabold mb-5 leading-[1.1] tracking-tight max-w-4xl mx-auto">
          <span className="text-text-primary">Peta Digital Arsip</span> <br className="hidden md:block" /> 
          <span className="bg-gradient-to-r from-primary via-secondary to-tertiary bg-clip-text text-transparent">Internal Lakespra</span>
        </h1>
        
        <p className="text-[15px] md:text-[17px] text-text-secondary mb-10 max-w-2xl mx-auto leading-relaxed">
          Temukan lokasi fisik dokumen kesehatan, peraturan teknis, dan surat keputusan dengan presisi. Sistem inventarisasi terpadu untuk efisiensi operasional personil.
        </p>

        {/* Premium Search Bar */}
        <div className="relative max-w-2xl mx-auto group">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary to-secondary rounded-[2rem] blur opacity-20 group-hover:opacity-30 transition duration-500"></div>
          <div className="relative bg-white/90 backdrop-blur-xl border border-white/60 p-1.5 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all flex items-center focus-within:ring-2 focus-within:ring-secondary/20">
            <div className="pl-4 pr-2 text-primary/60 flex items-center">
              <span className="material-symbols-outlined text-[26px]">search</span>
            </div>
            <input 
              className="w-full bg-transparent border-none focus:outline-none focus:ring-0 py-3.5 text-[16px] text-primary placeholder:text-text-secondary/60 font-medium" 
              placeholder="Cari nomor buku, judul dokumen, atau tahun..." 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button className="hidden md:flex items-center gap-1.5 bg-gradient-to-r from-primary to-secondary text-white px-7 py-3.5 rounded-[1.5rem] text-[14px] font-bold hover:shadow-md hover:shadow-primary/20 hover:-translate-y-0.5 transition-all duration-300">
              <span>Cari Arsip</span>
            </button>
          </div>
        </div>

        {/* Category Chips */}
        <div className="flex flex-wrap justify-center gap-2.5 mt-8 max-w-3xl mx-auto">
          {catNames.map(cat => (
            <button 
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2 rounded-full text-[13px] font-semibold transition-all duration-300 ${
                activeCategory === cat 
                  ? "bg-primary text-white shadow-md shadow-primary/20 scale-105" 
                  : "bg-white/60 backdrop-blur-sm border border-white/50 text-text-secondary hover:text-primary hover:bg-white hover:shadow-sm"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Main Results Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 md:px-10 pb-20">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <h2 className="font-display text-xl font-bold text-primary flex items-center gap-2">
            Hasil Pencarian 
            <span className="font-sans text-sm font-normal text-text-secondary bg-surface-container-low px-2.5 py-0.5 rounded-full">
              {filteredBooks.length} Dokumen
            </span>
          </h2>
          <div className="flex items-center gap-2 bg-white/50 backdrop-blur-sm border border-white/50 px-3 py-1.5 rounded-lg shadow-sm">
            <span className="material-symbols-outlined text-[16px] text-text-secondary">sort</span>
            <select className="bg-transparent border-none text-[13px] font-medium text-primary focus:outline-none cursor-pointer">
              <option>Terbaru</option>
              <option>Tahun (A-Z)</option>
              <option>Nomor Buku</option>
            </select>
          </div>
        </div>

        {/* Archive Results Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 min-h-[300px] relative">
          {loading && (
            <>
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white/80 border border-white/60 rounded-[1.25rem] p-6 flex flex-col min-h-[220px] animate-pulse">
                  <div className="flex justify-between items-start mb-4">
                    <div className="h-6 w-16 bg-surface-container rounded-md"></div>
                    <div className="h-6 w-12 bg-surface-container rounded-md"></div>
                  </div>
                  <div className="h-5 w-3/4 bg-surface-container rounded-md mb-2"></div>
                  <div className="h-5 w-1/2 bg-surface-container rounded-md mb-6"></div>
                  
                  <div className="mt-auto bg-surface-container-lowest/50 rounded-xl p-4 border border-dashed border-border-muted/60">
                    <div className="h-3 w-20 bg-surface-container rounded-md mb-3"></div>
                    <div className="flex gap-2">
                      <div className="flex-1 h-10 bg-surface-container rounded-lg"></div>
                      <div className="flex-1 h-10 bg-surface-container rounded-lg"></div>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}

          {!loading && filteredBooks.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-text-secondary/70">
              <span className="material-symbols-outlined text-[64px] mb-3 opacity-40">search_off</span>
              <p className="text-lg font-medium">Tidak ada dokumen yang ditemukan.</p>
              <p className="text-sm mt-1">Coba gunakan kata kunci lain atau ubah kategori filter.</p>
            </div>
          )}

          {(() => {
            const startIndex = (currentPage - 1) * itemsPerPage;
            const paginatedBooks = filteredBooks.slice(startIndex, startIndex + itemsPerPage);
            
            return paginatedBooks.map((book, index) => {
              const cardBgColors = ["bg-secondary/5", "bg-primary/5", "bg-tertiary/5"];
              const tagColors = ["bg-secondary/10 text-secondary border-secondary/20", "bg-primary/10 text-primary border-primary/20", "bg-tertiary/10 text-tertiary border-tertiary/20"];
              const colorIndex = index % 3;

            return (
              <div key={book.id} className="bg-white/80 backdrop-blur-xl border border-white/60 rounded-[1.25rem] hover:border-secondary/30 hover:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] hover:-translate-y-1 transition-all duration-300 group overflow-hidden flex flex-col relative">
                <div className={`absolute top-0 right-0 w-24 h-24 ${cardBgColors[colorIndex]} rounded-bl-full -z-10 transition-transform group-hover:scale-125 duration-700 ease-out`}></div>
                
                <div className="p-6 flex-grow flex flex-col">
                  {/* Top Badges */}
                  <div className="flex justify-between items-start mb-4">
                    <span className={`${tagColors[colorIndex]} border px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase`}>
                      {book.kategori || "UMUM"}
                    </span>
                    <span className="text-[11px] font-bold text-text-secondary bg-surface-container-low px-2 py-1 rounded-md border border-border-muted">
                      {book.year || "2024"}
                    </span>
                  </div>
                  
                  {/* Title & Info */}
                  <h3 className="font-display text-[17px] font-bold text-text-primary mb-2 line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                    {book.title}
                  </h3>
                  
                  <div className="flex items-center gap-1.5 text-[13px] text-text-secondary mb-6 font-medium">
                    <span className="material-symbols-outlined text-[16px]">qr_code_2</span>
                    {book.no || book.sku}
                  </div>

                  {/* Physical Location Box */}
                  <div className="mt-auto bg-surface-container-lowest/50 rounded-xl p-4 border border-dashed border-border-muted/60">
                    <div className="flex items-center gap-1.5 mb-2.5">
                      <span className="material-symbols-outlined text-[14px] text-secondary">location_on</span>
                      <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Lokasi Fisik</span>
                    </div>
                    
                    <div className="flex justify-between items-center gap-2">
                      <div className="flex-1 bg-white/50 rounded-lg px-3 py-2 border border-white/60">
                        <p className="text-[9px] font-semibold text-text-secondary/80 mb-0.5 uppercase tracking-wider">Lemari</p>
                        <p className="text-[13px] text-primary font-bold truncate">{book.lemari || "-"}</p>
                      </div>
                      <div className="flex-1 bg-white/50 rounded-lg px-3 py-2 border border-white/60">
                        <p className="text-[9px] font-semibold text-text-secondary/80 mb-0.5 uppercase tracking-wider">Rak / Box</p>
                        <p className="text-[13px] text-secondary font-bold truncate">{book.rak || "-"}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Action Footer */}
                <Link 
                  href={`/pencarian/${book.id}`}
                  className="px-6 py-3.5 border-t border-white/60 bg-gradient-to-r hover:from-primary hover:to-secondary group-hover:text-white text-primary text-[13px] font-bold transition-all duration-300 flex items-center justify-between cursor-pointer"
                >
                  Detail Arsip 
                  <span className="material-symbols-outlined text-[18px] transform group-hover:translate-x-1 transition-transform">arrow_forward</span>
                </Link>
              </div>
            );
          });
          })()}
        </div>

        {/* Pagination Controls */}
        {filteredBooks.length > 0 && (
          <div className="mt-12 flex flex-col sm:flex-row justify-between items-center gap-4 bg-white/50 backdrop-blur-sm border border-white/50 p-4 rounded-2xl shadow-sm">
            <span className="text-[13px] font-medium text-text-secondary">
              Menampilkan {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredBooks.length)} dari {filteredBooks.length} arsip
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-white hover:border-border-muted text-text-secondary hover:text-primary disabled:opacity-50 transition-all shadow-sm"
              >
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <span className="font-label-md text-[13px] font-bold text-primary px-3">
                {currentPage} / {Math.ceil(filteredBooks.length / itemsPerPage)}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(Math.ceil(filteredBooks.length / itemsPerPage), p + 1))}
                disabled={currentPage === Math.ceil(filteredBooks.length / itemsPerPage)}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-white hover:border-border-muted text-text-secondary hover:text-primary disabled:opacity-50 transition-all shadow-sm"
              >
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
    </AuthGuard>
  );
}
