"use client";

import { useState, useEffect } from "react";
import { collection, addDoc, serverTimestamp, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import toast from "react-hot-toast";

export default function InputDokumenBaru() {
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    noBuku: "",
    kategori: "",
    judul: "",
    tahun: "",
    lemari: "",
    rak: "",
    keterangan: ""
  });
  
  const [categories, setCategories] = useState<{id: string, name: string}[]>([]);
  const [loadingCats, setLoadingCats] = useState(true);

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const q = query(collection(db, "categories"), orderBy("name", "asc"));
        const snapshot = await getDocs(q);
        setCategories(snapshot.docs.map(doc => ({ id: doc.id, name: doc.data().name })));
      } catch (err) {
        console.error("Error fetching categories", err);
      } finally {
        setLoadingCats(false);
      }
    };
    fetchCats();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSimpan = async () => {
    if (!formData.noBuku || !formData.judul || !formData.kategori) {
      setMessage({ type: "error", text: "Harap lengkapi field yang wajib (Nomor Buku, Judul, Kategori)." });
      return;
    }

    setLoading(true);

    try {
      await addDoc(collection(db, "books"), {
        no: formData.noBuku,
        sku: formData.noBuku,
        title: formData.judul,
        kategori: formData.kategori,
        loc: `${formData.lemari} / ${formData.rak}`,
        lemari: formData.lemari,
        rak: formData.rak,
        year: formData.tahun || new Date().getFullYear().toString(),
        keterangan: formData.keterangan,
        createdAt: serverTimestamp(),
      });
      
      setFormData({ noBuku: "", kategori: "", judul: "", tahun: "", lemari: "", rak: "", keterangan: "" });
      toast.success("Data arsip berhasil disimpan ke database!");
    } catch (error) {
      console.error("Error adding document: ", error);
      toast.error("Terjadi kesalahan saat menyimpan data.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-grow flex flex-col min-w-0 bg-background h-full relative">
      <main className="flex-grow py-8 max-w-max-width w-full">
        <div className="mb-8">
          <h2 className="font-title-md text-title-md text-text-primary">Registrasi Buku Baru</h2>
          <p className="text-text-secondary font-body-md text-body-md">Lengkapi data arsip fisik di bawah ini untuk disimpan ke sistem database pusat.</p>
        </div>

        {/* Bento Form Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
          
          {/* Left Column: Document Identity & Physical Location */}
          <div className="lg:col-span-7 flex flex-col gap-gutter">
            {/* Identity Section */}
            <section className="bg-surface-container-lowest border border-border-muted rounded-xl p-6">
              <div className="flex items-center gap-2 mb-6 border-b border-border-muted pb-4">
                <span className="material-symbols-outlined text-secondary">description</span>
                <h3 className="font-label-md text-label-md text-text-primary uppercase tracking-wider">Identitas Dokumen</h3>
              </div>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="font-label-md text-label-md text-text-primary">Nomor Buku *</label>
                    <input 
                      name="noBuku"
                      value={formData.noBuku}
                      onChange={handleChange}
                      className="bg-surface-container-low border-border-muted rounded-lg px-4 py-3 font-code-sm text-code-sm placeholder:text-text-secondary/50 focus:ring-1 focus:ring-secondary focus:outline-none" 
                      placeholder="LKS-AR-2024-001" 
                      type="text" 
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="font-label-md text-label-md text-text-primary">Kategori *</label>
                    <div className="relative group">
                      <select 
                        name="kategori"
                        value={formData.kategori}
                        onChange={handleChange}
                        className="appearance-none w-full bg-surface-container-low border-border-muted rounded-lg px-4 py-3 text-body-md focus:ring-1 focus:ring-secondary focus:outline-none"
                      >
                        <option disabled value="">{loadingCats ? "Memuat kategori..." : "Pilih Kategori..."}</option>
                        {categories.map(c => (
                          <option key={c.id} value={c.name}>{c.name}</option>
                        ))}
                      </select>
                      <span className="material-symbols-outlined absolute right-3 top-3.5 text-text-secondary pointer-events-none group-focus-within:rotate-180 transition-transform">expand_more</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-label-md text-label-md text-text-primary">Judul Buku / Nama Arsip *</label>
                  <input 
                    name="judul"
                    value={formData.judul}
                    onChange={handleChange}
                    className="bg-surface-container-low border-border-muted rounded-lg px-4 py-3 text-body-md placeholder:text-text-secondary/50 focus:ring-1 focus:ring-secondary focus:outline-none" 
                    placeholder="Contoh: Laporan Tahunan Kesehatan Penerbang 2023" 
                    type="text" 
                  />
                </div>
              </div>
            </section>

            {/* Location Section */}
            <section className="bg-surface-container-lowest border border-border-muted rounded-xl p-6">
              <div className="flex items-center gap-2 mb-6 border-b border-border-muted pb-4">
                <span className="material-symbols-outlined text-secondary">location_on</span>
                <h3 className="font-label-md text-label-md text-text-primary uppercase tracking-wider">Lokasi Fisik</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-label-md text-label-md text-text-primary">Lemari (Storage Unit)</label>
                  <div className="relative">
                    <select 
                      name="lemari"
                      value={formData.lemari}
                      onChange={handleChange}
                      className="appearance-none w-full bg-surface-container-low border-border-muted rounded-lg px-4 py-3 text-body-md focus:ring-1 focus:ring-secondary focus:outline-none"
                    >
                      <option disabled value="">Pilih Lemari...</option>
                      <option value="LEMARI A">LEMARI A</option>
                      <option value="LEMARI B">LEMARI B</option>
                      <option value="LEMARI C">LEMARI C</option>
                      <option value="VAULT-01">VAULT-01</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-3 top-3.5 text-text-secondary pointer-events-none">expand_more</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-label-md text-label-md text-text-primary">Rak / Box Number</label>
                  <div className="relative">
                    <select 
                      name="rak"
                      value={formData.rak}
                      onChange={handleChange}
                      className="appearance-none w-full bg-surface-container-low border-border-muted rounded-lg px-4 py-3 text-body-md focus:ring-1 focus:ring-secondary focus:outline-none"
                    >
                      <option disabled value="">Pilih Rak...</option>
                      <option value="RAK 1 / BOX OPS">RAK 1 / BOX OPS</option>
                      <option value="RAK 2">RAK 2</option>
                      <option value="RAK 3 / BOX MEDIS">RAK 3 / BOX MEDIS</option>
                      <option value="RAK 5 / BOX TEKNIS">RAK 5 / BOX TEKNIS</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-3 top-3.5 text-text-secondary pointer-events-none">expand_more</span>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Right Column: Year, Notes */}
          <div className="lg:col-span-5 flex flex-col gap-gutter">
            {/* Year Section */}
            <section className="bg-surface-container-lowest border border-border-muted rounded-xl p-6">
              <div className="flex items-center gap-2 mb-6 border-b border-border-muted pb-4">
                <span className="material-symbols-outlined text-secondary">calendar_month</span>
                <h3 className="font-label-md text-label-md text-text-primary uppercase tracking-wider">Tahun Arsip</h3>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-label-md text-label-md text-text-primary">Tahun Terbit / Pembuatan</label>
                <input 
                  name="tahun"
                  value={formData.tahun}
                  onChange={handleChange}
                  className="bg-surface-container-low border-border-muted rounded-lg px-4 py-3 font-code-sm text-code-sm placeholder:text-text-secondary/50 focus:ring-1 focus:ring-secondary focus:outline-none" 
                  placeholder="Contoh: 2023" 
                  type="number"
                  min="1900"
                  max="2099"
                />
                <p className="text-[11px] text-text-secondary mt-1">Jika dikosongkan, otomatis diisi tahun saat ini.</p>
              </div>
            </section>

            {/* Keterangan Section */}
            <section className="bg-surface-container-lowest border border-border-muted rounded-xl p-6 flex-1">
              <div className="flex items-center gap-2 mb-6 border-b border-border-muted pb-4">
                <span className="material-symbols-outlined text-secondary">notes</span>
                <h3 className="font-label-md text-label-md text-text-primary uppercase tracking-wider">Keterangan Tambahan</h3>
              </div>
              <div className="flex flex-col gap-1.5 h-full">
                <label className="font-label-md text-label-md text-text-primary">Catatan (Opsional)</label>
                <textarea 
                  name="keterangan"
                  value={formData.keterangan}
                  onChange={(e) => setFormData({...formData, keterangan: e.target.value})}
                  className="bg-surface-container-low border-border-muted rounded-lg px-4 py-3 text-body-md placeholder:text-text-secondary/50 focus:ring-1 focus:ring-secondary focus:outline-none flex-1 min-h-[120px] resize-none" 
                  placeholder="Tambahkan catatan khusus tentang kondisi dokumen, atau informasi pendukung lainnya..." 
                />
              </div>
            </section>
          </div>
        </div>

        {/* Footer Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row justify-end items-center gap-4 py-6 border-t border-border-muted">
          <button 
            type="button"
            className="w-full sm:w-auto px-10 py-3 rounded-lg border border-border-muted text-text-primary hover:bg-surface-container-high transition-colors font-label-md text-label-md tracking-wider"
            onClick={() => setFormData({noBuku: "", kategori: "", judul: "", tahun: "", lemari: "", rak: "", keterangan: ""})}
          >
            BATAL
          </button>
          <button 
            type="button"
            onClick={handleSimpan}
            disabled={loading}
            className="w-full sm:w-auto px-12 py-3 rounded-lg bg-primary text-on-primary hover:opacity-90 transition-opacity font-label-md text-label-md tracking-wider flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="material-symbols-outlined text-sm animate-spin">sync</span>
            ) : (
              <span className="material-symbols-outlined text-sm">save</span>
            )}
            {loading ? "MENYIMPAN..." : "SIMPAN DATA"}
          </button>
        </div>
      </main>
    </div>
  );
}
