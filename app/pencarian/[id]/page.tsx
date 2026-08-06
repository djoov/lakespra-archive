"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
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
  keterangan: string;
};

export default function DetailArsip() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) return;
      
      try {
        const docRef = doc(db, "books", id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setBook({ id: docSnap.id, ...docSnap.data() } as Book);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error("Error fetching document:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [id]);

  return (
    <AuthGuard>
      <div className="min-h-screen bg-surface flex flex-col relative overflow-hidden">
        {/* Background Elements */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-primary-container/20 rounded-full mix-blend-multiply filter blur-[100px] opacity-70 animate-blob"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-secondary-container/20 rounded-full mix-blend-multiply filter blur-[120px] opacity-60 animate-blob animation-delay-2000"></div>
        </div>

        {/* Header Navigation */}
        <header className="relative z-10 w-full bg-white/70 backdrop-blur-xl border-b border-white/50 sticky top-0 shadow-sm">
          <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
            <button 
              onClick={() => router.back()}
              className="flex items-center gap-2 text-text-secondary hover:text-primary transition-colors font-label-md text-[13px]"
            >
              <span className="material-symbols-outlined text-[20px]">arrow_back</span>
              Kembali
            </button>
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="Lakespra Logo" className="w-8 h-8 object-contain" />
              <span className="font-display font-bold text-primary tracking-tight">Detail Arsip</span>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="relative z-10 flex-grow py-10 px-6">
          <div className="max-w-4xl mx-auto">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-32 opacity-60">
                <span className="material-symbols-outlined animate-spin text-4xl text-primary" style={{ animationDuration: '2s' }}>sync</span>
                <p className="mt-4 font-medium text-primary">Memuat data arsip...</p>
              </div>
            ) : error || !book ? (
              <div className="flex flex-col items-center justify-center py-32 bg-white/60 backdrop-blur-md rounded-3xl border border-white/60 shadow-sm">
                <span className="material-symbols-outlined text-6xl text-text-secondary opacity-40 mb-4">description</span>
                <h2 className="font-display text-2xl font-bold text-text-primary mb-2">Dokumen Tidak Ditemukan</h2>
                <p className="text-text-secondary">Arsip yang Anda cari tidak ada atau telah dihapus.</p>
                <button 
                  onClick={() => router.push("/pencarian")}
                  className="mt-8 px-6 py-2.5 bg-primary text-white rounded-lg font-label-md hover:bg-primary/90 transition-colors"
                >
                  Kembali ke Pencarian
                </button>
              </div>
            ) : (
              <div className="bg-white/80 backdrop-blur-xl border border-white/60 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
                {/* Banner/Header of Card */}
                <div className="bg-gradient-to-r from-primary to-secondary p-8 sm:p-10 relative overflow-hidden">
                  {/* Decorative Icon */}
                  <span className="material-symbols-outlined absolute -right-4 -bottom-8 text-[140px] text-white/10 -rotate-12 select-none">description</span>
                  
                  <div className="flex gap-3 mb-6 relative z-10">
                    <span className="bg-white/20 backdrop-blur-sm text-white border border-white/30 px-3 py-1 rounded-md text-[11px] font-bold tracking-wider uppercase">
                      {book.kategori || "UMUM"}
                    </span>
                    <span className="bg-white/10 backdrop-blur-sm text-white/90 border border-white/20 px-3 py-1 rounded-md text-[11px] font-bold">
                      TAHUN {book.year || "-"}
                    </span>
                  </div>
                  
                  <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight relative z-10">
                    {book.title}
                  </h1>
                </div>

                {/* Content Details */}
                <div className="p-8 sm:p-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    {/* Identitas Dokumen */}
                    <div>
                      <div className="flex items-center gap-2 mb-5 border-b border-border-muted pb-3">
                        <span className="material-symbols-outlined text-secondary">info</span>
                        <h3 className="font-label-md text-sm text-text-primary uppercase tracking-wider font-bold">Identitas Dokumen</h3>
                      </div>
                      
                      <div className="space-y-6">
                        <div>
                          <p className="text-[11px] font-bold text-text-secondary/70 uppercase tracking-wider mb-1">Nomor Buku / SKU</p>
                          <p className="font-code-sm text-[15px] font-medium text-text-primary bg-surface-container-low px-3 py-2 rounded-lg border border-border-muted/50 inline-block">
                            {book.no || book.sku || "-"}
                          </p>
                        </div>
                        
                        <div>
                          <p className="text-[11px] font-bold text-text-secondary/70 uppercase tracking-wider mb-1">Kategori Arsip</p>
                          <p className="text-body-md text-text-primary font-medium">{book.kategori || "-"}</p>
                        </div>

                        <div>
                          <p className="text-[11px] font-bold text-text-secondary/70 uppercase tracking-wider mb-1">Keterangan / Catatan</p>
                          <div className="text-[14px] text-text-secondary leading-relaxed bg-surface-container-lowest border border-border-muted rounded-xl p-4 min-h-[100px]">
                            {book.keterangan ? (
                              <p>{book.keterangan}</p>
                            ) : (
                              <p className="italic opacity-50">Tidak ada catatan tambahan untuk dokumen ini.</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Lokasi Fisik */}
                    <div>
                      <div className="flex items-center gap-2 mb-5 border-b border-border-muted pb-3">
                        <span className="material-symbols-outlined text-secondary">location_on</span>
                        <h3 className="font-label-md text-sm text-text-primary uppercase tracking-wider font-bold">Lokasi Penyimpanan Fisik</h3>
                      </div>

                      <div className="bg-surface-container-lowest/50 rounded-2xl p-6 border border-dashed border-secondary/30 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-secondary/5 rounded-bl-full -z-10"></div>
                        
                        <div className="space-y-6">
                          <div>
                            <p className="text-[11px] font-bold text-secondary/70 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                              <span className="material-symbols-outlined text-[14px]">door_front</span> Lemari
                            </p>
                            <p className="text-xl font-display font-bold text-primary">{book.lemari || "-"}</p>
                          </div>
                          
                          <div className="w-full h-px bg-border-muted"></div>
                          
                          <div>
                            <p className="text-[11px] font-bold text-secondary/70 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                              <span className="material-symbols-outlined text-[14px]">shelves</span> Rak / Box
                            </p>
                            <p className="text-xl font-display font-bold text-primary">{book.rak || "-"}</p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Bantuan */}
                      <div className="mt-6 flex items-start gap-3 p-4 bg-secondary/5 rounded-xl border border-secondary/10">
                        <span className="material-symbols-outlined text-secondary">help</span>
                        <div>
                          <p className="text-[12px] font-bold text-primary mb-0.5">Butuh dokumen fisiknya?</p>
                          <p className="text-[12px] text-text-secondary leading-relaxed">Berikan identitas dokumen dan lokasi penyimpanan ini kepada petugas arsip untuk proses peminjaman.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
