"use client";

import { useState, useEffect } from "react";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import toast from "react-hot-toast";

type Category = {
  id: string;
  name: string;
};

export default function ManajemenKategori() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State for Add
  const [newCategory, setNewCategory] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  // State for Edit
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const fetchCategories = async () => {
    try {
      const q = query(collection(db, "categories"), orderBy("name", "asc"));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name
      })) as Category[];
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.trim()) return;
    
    setIsAdding(true);
    try {
      await addDoc(collection(db, "categories"), {
        name: newCategory.trim(),
        createdAt: serverTimestamp()
      });
      setNewCategory("");
      toast.success("Kategori berhasil ditambahkan!");
      await fetchCategories();
    } catch (error) {
      console.error("Error adding category:", error);
      toast.error("Gagal menambahkan kategori.");
    } finally {
      setIsAdding(false);
    }
  };

  const startEdit = (cat: Category) => {
    setEditingId(cat.id);
    setEditName(cat.name);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
  };

  const handleUpdate = async (id: string) => {
    if (!editName.trim()) return;
    try {
      await updateDoc(doc(db, "categories", id), {
        name: editName.trim()
      });
      setEditingId(null);
      toast.success("Kategori berhasil diperbarui!");
      await fetchCategories();
    } catch (error) {
      console.error("Error updating category:", error);
      toast.error("Gagal menyimpan perubahan.");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    const confirmed = window.confirm(`Hapus kategori "${name}"?\n\nCatatan: Arsip yang sudah menggunakan kategori ini tidak akan otomatis berubah kategorinya.`);
    if (!confirmed) return;
    
    try {
      await deleteDoc(doc(db, "categories", id));
      toast.success("Kategori berhasil dihapus!");
      await fetchCategories();
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("Gagal menghapus kategori.");
    }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-surface relative max-w-4xl mx-auto w-full py-8">
      <div className="mb-10">
        <h2 className="font-display text-3xl font-bold text-primary mb-2">Manajemen Kategori</h2>
        <p className="font-sans text-[15px] text-text-secondary max-w-3xl">
          Kelola daftar kategori arsip yang akan muncul sebagai pilihan saat menambahkan dokumen baru dan di menu filter halaman pencarian.
        </p>
      </div>

      {/* Add New Category Form */}
      <div className="bg-white/70 backdrop-blur-md border border-border-muted p-6 rounded-2xl shadow-sm mb-8">
        <h3 className="font-display text-lg font-bold text-primary mb-4">Tambah Kategori Baru</h3>
        <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-4">
          <input 
            type="text"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="Masukkan nama kategori (contoh: Surat Keputusan)"
            className="flex-1 bg-surface-container-low border border-border-muted rounded-xl px-4 py-3 font-sans text-[15px] focus:ring-2 focus:ring-secondary/50 focus:outline-none transition-shadow"
            required
          />
          <button 
            type="submit"
            disabled={isAdding || !newCategory.trim()}
            className="bg-primary text-white px-8 py-3 rounded-xl font-bold text-[14px] hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            {isAdding ? "Menyimpan..." : "Tambah"}
          </button>
        </form>
      </div>

      {/* Categories List */}
      <div className="bg-white/70 backdrop-blur-md border border-border-muted rounded-2xl shadow-sm overflow-hidden flex-1">
        <div className="px-6 py-4 bg-surface-container-low border-b border-border-muted flex justify-between items-center">
          <h3 className="font-display text-[16px] font-bold text-primary">Daftar Kategori Saat Ini</h3>
          <span className="bg-white px-3 py-1 rounded-lg text-[12px] font-bold text-text-secondary border border-border-muted">
            {categories.length} Kategori
          </span>
        </div>
        
        {loading ? (
          <div className="p-12 flex justify-center">
            <span className="material-symbols-outlined animate-spin text-3xl text-primary">sync</span>
          </div>
        ) : categories.length === 0 ? (
          <div className="p-12 text-center text-text-secondary">
            <span className="material-symbols-outlined text-4xl mb-2 opacity-50">category</span>
            <p className="font-medium text-[15px]">Belum ada kategori.</p>
            <p className="text-[13px] mt-1">Silakan tambah kategori baru melalui form di atas.</p>
          </div>
        ) : (
          <ul className="divide-y divide-border-muted">
            {categories.map((cat) => (
              <li key={cat.id} className="p-4 sm:px-6 hover:bg-surface-container-lowest/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 group">
                
                {/* View/Edit Mode */}
                {editingId === cat.id ? (
                  <div className="flex-1 flex items-center gap-3">
                    <input 
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="flex-1 bg-white border border-secondary rounded-lg px-3 py-2 font-sans text-[15px] focus:outline-none focus:ring-1 focus:ring-secondary"
                      autoFocus
                    />
                    <button 
                      onClick={() => handleUpdate(cat.id)}
                      disabled={!editName.trim() || editName === cat.name}
                      className="p-2 bg-success text-white rounded-lg hover:bg-success/90 transition-colors disabled:opacity-50"
                      title="Simpan"
                    >
                      <span className="material-symbols-outlined text-[20px]">check</span>
                    </button>
                    <button 
                      onClick={cancelEdit}
                      className="p-2 bg-surface-container border border-border-muted text-text-secondary rounded-lg hover:bg-surface-container-high transition-colors"
                      title="Batal"
                    >
                      <span className="material-symbols-outlined text-[20px]">close</span>
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-text-secondary/50">label</span>
                      <span className="font-sans font-medium text-[15px] text-text-primary">{cat.name}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => startEdit(cat)}
                        className="p-2 text-text-secondary hover:text-secondary hover:bg-secondary/10 rounded-lg transition-colors flex items-center gap-1 text-[13px] font-medium"
                      >
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                        <span className="sm:hidden">Edit</span>
                      </button>
                      <button 
                        onClick={() => handleDelete(cat.id, cat.name)}
                        className="p-2 text-text-secondary hover:text-danger hover:bg-danger/10 rounded-lg transition-colors flex items-center gap-1 text-[13px] font-medium"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                        <span className="sm:hidden">Hapus</span>
                      </button>
                    </div>
                  </>
                )}

              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
