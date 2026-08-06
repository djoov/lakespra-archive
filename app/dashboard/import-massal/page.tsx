"use client";

import { useRef, useState } from "react";
import { collection, getDocs, writeBatch, doc, serverTimestamp, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import toast from "react-hot-toast";

type CsvRow = {
  kategori: string;
  noBuku: string;
  judul: string;
  tahun: string;
  lemari: string;
  rak: string;
};

type ValidationIssue = {
  row: number;
  field: string;
  message: string;
  severity: "error" | "warning";
};

export default function ImportMassal() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileInfo, setFileInfo] = useState<{name: string, size: string} | null>(null);
  const [parsedRows, setParsedRows] = useState<CsvRow[]>([]);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [validationIssues, setValidationIssues] = useState<ValidationIssue[]>([]);
  const [duplicatesInCsv, setDuplicatesInCsv] = useState<string[]>([]);
  const [skipDuplicates, setSkipDuplicates] = useState(true);

  const downloadTemplate = () => {
    const csvContent = "Kategori,Nomor Buku,Judul,Tahun,Lemari,Rak/Box\nPetunjuk Teknis,LKS-AR-2024-001,Contoh Judul Dokumen,2024,LEMARI A,RAK 1 / BOX OPS\n";
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'template_import_lakespra.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  // Robust CSV parser that handles quoted fields with commas
  const parseCsv = (text: string): CsvRow[] => {
    const lines = text.trim().split("\n");
    if (lines.length < 2) return [];

    const headerLine = lines[0];
    const separator = headerLine.includes(";") ? ";" : ",";

    const parseRow = (line: string): string[] => {
      const result: string[] = [];
      let current = "";
      let inQuotes = false;

      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          if (inQuotes && line[i + 1] === '"') {
            current += '"';
            i++; // skip escaped quote
          } else {
            inQuotes = !inQuotes;
          }
        } else if (char === separator && !inQuotes) {
          result.push(current.trim());
          current = "";
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result;
    };

    const headers = parseRow(headerLine).map(h => h.toLowerCase().replace(/[\[\]"]/g, "").trim());

    const rows: CsvRow[] = [];
    const issues: ValidationIssue[] = [];
    const seenNoBuku = new Set<string>();
    const csvDuplicates: string[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue; // skip truly empty lines

      const values = parseRow(line);
      if (values.length < 2) continue;

      const row: Record<string, string> = {};
      headers.forEach((h, idx) => {
        row[h] = (values[idx] || "").replace(/^"|"$/g, "");
      });

      const noBuku = row["nomor buku"] || row["no buku"] || row["nobuku"] || row["no"] || "";
      const judul = row["judul"] || row["title"] || "";
      const tahun = row["tahun"] || row["year"] || "";
      const kategori = row["kategori"] || "";

      // Validation: required fields
      if (!judul) {
        issues.push({ row: i + 1, field: "Judul", message: "Judul dokumen kosong", severity: "error" });
      }
      if (!noBuku) {
        issues.push({ row: i + 1, field: "No. Buku", message: "Nomor Buku kosong", severity: "warning" });
      }
      if (!kategori) {
        issues.push({ row: i + 1, field: "Kategori", message: "Kategori kosong", severity: "warning" });
      }
      // Validation: tahun format
      if (tahun && !/^\d{4}$/.test(tahun)) {
        issues.push({ row: i + 1, field: "Tahun", message: `Format tahun tidak valid: "${tahun}"`, severity: "warning" });
      }

      // Detect duplicates within CSV
      if (noBuku) {
        if (seenNoBuku.has(noBuku.toLowerCase())) {
          csvDuplicates.push(noBuku);
          issues.push({ row: i + 1, field: "No. Buku", message: `Duplikat di dalam CSV: "${noBuku}"`, severity: "warning" });
        }
        seenNoBuku.add(noBuku.toLowerCase());
      }

      rows.push({
        kategori,
        noBuku,
        judul,
        tahun,
        lemari: row["lemari"] || "",
        rak: row["rak/box"] || row["rak"] || row["box"] || "",
      });
    }

    setValidationIssues(issues);
    setDuplicatesInCsv([...new Set(csvDuplicates)]);
    return rows;
  };

  const handleFileChange = (files: FileList | null) => {
    if (files && files.length > 0) {
      const file = files[0];
      if (!file.name.endsWith('.csv')) {
        toast.error('Mohon unggah berkas dalam format .CSV');
        return;
      }

      setFileInfo({
        name: file.name,
        size: (file.size / (1024 * 1024)).toFixed(2) + ' MB'
      });
      setValidationIssues([]);
      setDuplicatesInCsv([]);

      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const rows = parseCsv(text);
        setParsedRows(rows);
        
        if (rows.length > 0) {
          toast.success(`${rows.length} baris data berhasil dibaca dari CSV.`);
        } else {
          toast.error("Tidak ditemukan data yang valid dalam file CSV.");
        }
      };
      reader.readAsText(file);
    }
  };

  const handleImport = async () => {
    // Filter out rows with critical errors (no title)
    const validRows = parsedRows.filter(r => r.judul.trim() !== "");
    
    if (validRows.length === 0) {
      toast.error("Tidak ada data valid yang bisa diimpor. Pastikan kolom Judul terisi.");
      return;
    }

    setImporting(true);
    setProgress(0);

    try {
      let rowsToImport = validRows;
      let skippedCount = 0;

      // Check for duplicates against existing database
      if (skipDuplicates) {
        const existingSnapshot = await getDocs(collection(db, "books"));
        const existingNos = new Set<string>();
        existingSnapshot.forEach(doc => {
          const data = doc.data();
          if (data.no) existingNos.add(data.no.toLowerCase());
          if (data.sku) existingNos.add(data.sku.toLowerCase());
        });

        const beforeCount = rowsToImport.length;
        rowsToImport = rowsToImport.filter(r => {
          if (!r.noBuku) return true; // Allow rows without noBuku (they can't be duplicate)
          return !existingNos.has(r.noBuku.toLowerCase());
        });
        skippedCount = beforeCount - rowsToImport.length;

        // Also remove CSV-internal duplicates (keep first occurrence)
        const seen = new Set<string>();
        rowsToImport = rowsToImport.filter(r => {
          if (!r.noBuku) return true;
          const key = r.noBuku.toLowerCase();
          if (seen.has(key)) {
            skippedCount++;
            return false;
          }
          seen.add(key);
          return true;
        });
      }

      if (rowsToImport.length === 0) {
        toast.error("Semua data sudah ada di database (duplikat). Tidak ada data baru yang diimpor.");
        setImporting(false);
        return;
      }

      // Firestore batch limit is 500 per batch
      const batchSize = 450;
      let imported = 0;

      for (let i = 0; i < rowsToImport.length; i += batchSize) {
        const batch = writeBatch(db);
        const chunk = rowsToImport.slice(i, i + batchSize);

        for (const row of chunk) {
          const docRef = doc(collection(db, "books"));
          batch.set(docRef, {
            no: row.noBuku,
            sku: row.noBuku,
            title: row.judul,
            kategori: row.kategori,
            loc: `${row.lemari} / ${row.rak}`,
            lemari: row.lemari,
            rak: row.rak,
            year: row.tahun,
            createdAt: serverTimestamp(),
          });
        }

        await batch.commit();
        imported += chunk.length;
        setProgress(Math.round((imported / rowsToImport.length) * 100));
      }

      let message = `Berhasil mengimpor ${imported} data arsip ke database!`;
      if (skippedCount > 0) {
        message += ` (${skippedCount} data duplikat dilewati)`;
      }
      toast.success(message);

      setParsedRows([]);
      setFileInfo(null);
      setValidationIssues([]);
      setDuplicatesInCsv([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      console.error("Import error:", error);
      toast.error("Terjadi kesalahan saat mengimpor data ke database.");
    } finally {
      setImporting(false);
      setProgress(0);
    }
  };

  const errorCount = validationIssues.filter(v => v.severity === "error").length;
  const warningCount = validationIssues.filter(v => v.severity === "warning").length;

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-surface relative">
      <div className="flex-1 max-w-max-width mx-auto w-full py-8">
        <div className="mb-10">
          <h2 className="font-display-lg text-display-lg text-primary mb-2">IMPORT DATA MASSAL (.CSV)</h2>
          <p className="font-body-lg text-body-lg text-text-secondary max-w-3xl">
            Lakukan pembaruan basis data arsip secara efisien dengan mengunggah berkas terstruktur. Pastikan format kolom sesuai dengan standarisasi Lakespra Archive.
          </p>
        </div>

        {/* Bento Layout for Import Flow */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
          {/* Left: Instructions & Structure */}
          <div className="lg:col-span-4 space-y-gutter">
            {/* Steps Card */}
            <div className="bg-surface-container-lowest p-8 rounded-xl border border-border-muted">
              <h3 className="font-title-md text-title-md text-primary mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary">info</span>
                Langkah Persiapan
              </h3>
              <ol className="space-y-6">
                <li className="flex gap-4">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold font-label-md">1</span>
                  <div>
                    <p className="font-label-md text-label-md text-primary">Unduh Template</p>
                    <p className="font-body-md text-body-md text-text-secondary mt-1">Gunakan berkas .csv standar untuk meminimalisir kesalahan sistem.</p>
                    <button 
                      onClick={downloadTemplate}
                      className="mt-2 inline-flex items-center gap-1 text-secondary hover:text-primary font-label-md text-[12px] transition-colors"
                    >
                      <span className="material-symbols-outlined text-[16px]">download</span>
                      Download template_import_lakespra.csv
                    </button>
                  </div>
                </li>
                <li className="flex gap-4">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold font-label-md">2</span>
                  <div>
                    <p className="font-label-md text-label-md text-primary">Validasi Data</p>
                    <p className="font-body-md text-body-md text-text-secondary mt-1">Pastikan [Tahun] berupa angka dan [Nomor Buku] unik.</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold font-label-md">3</span>
                  <div>
                    <p className="font-label-md text-label-md text-primary">Unggah Berkas</p>
                    <p className="font-body-md text-body-md text-text-secondary mt-1">Drag file ke area unggah dan tekan tombol konfirmasi.</p>
                  </div>
                </li>
              </ol>
            </div>

            {/* Column Guide Card */}
            <div className="p-8 rounded-xl bg-surface-container-low border-none">
              <h3 className="font-label-md text-label-md text-primary mb-4 uppercase tracking-widest">Required Columns</h3>
              <div className="flex flex-wrap gap-2">
                {["[Kategori]", "[Nomor Buku]", "[Judul]*", "[Tahun]", "[Lemari]", "[Rak/Box]"].map(col => (
                  <span key={col} className="px-3 py-1 bg-white border border-border-muted rounded font-code-sm text-code-sm text-primary">{col}</span>
                ))}
              </div>
              <p className="text-[11px] text-text-secondary mt-3">* Kolom bertanda wajib diisi. Baris tanpa Judul akan dilewati.</p>
            </div>

            {/* Duplicate Handling Option */}
            <div className="p-6 rounded-xl bg-surface-container-lowest border border-border-muted">
              <h3 className="font-label-md text-label-md text-primary mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-secondary">content_copy</span>
                Penanganan Duplikat
              </h3>
              <label className="flex items-start gap-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={skipDuplicates} 
                  onChange={(e) => setSkipDuplicates(e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-primary"
                />
                <div>
                  <p className="font-label-md text-[13px] text-text-primary">Lewati data duplikat</p>
                  <p className="text-[12px] text-text-secondary mt-0.5">Jika Nomor Buku sudah ada di database, baris tersebut akan dilewati secara otomatis.</p>
                </div>
              </label>
            </div>
          </div>

          {/* Right: Dropzone */}
          <div className="lg:col-span-8">
            <div className="bg-surface-container-lowest border border-border-muted h-full p-gutter rounded-xl flex flex-col">
              <div 
                className="flex-1 border-2 border-dashed border-border-muted rounded-xl bg-surface-bright flex flex-col items-center justify-center text-center p-12 transition-all hover:border-secondary hover:bg-white group cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => { e.preventDefault(); handleFileChange(e.dataTransfer.files); }}
              >
                <div className="w-20 h-20 rounded-full bg-secondary-container/30 flex items-center justify-center mb-6 transition-transform group-hover:scale-110">
                  <span className="material-symbols-outlined text-secondary text-5xl">cloud_upload</span>
                </div>
                <h3 className="font-headline-lg text-headline-lg text-primary mb-2">Seret & Lepas Berkas</h3>
                <p className="font-body-lg text-body-lg text-text-secondary mb-8">Format yang didukung: .csv (Maksimal 25MB)</p>
                <input 
                  accept=".csv" 
                  className="hidden" 
                  type="file" 
                  ref={fileInputRef}
                  onChange={(e) => handleFileChange(e.target.files)}
                />
                <button className="px-8 py-3 bg-white border border-border-muted text-primary font-label-md text-label-md rounded-xl hover:bg-surface-container-low transition-all active:scale-95 shadow-sm">
                  Pilih File dari Perangkat
                </button>
              </div>

              {/* Validation Issues */}
              {validationIssues.length > 0 && (
                <div className="mt-6 rounded-xl border border-border-muted overflow-hidden">
                  <div className="bg-surface-container-low px-6 py-3 border-b border-border-muted flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-[18px] text-text-secondary">checklist</span>
                      <p className="font-label-md text-label-md text-primary">Hasil Validasi</p>
                    </div>
                    <div className="flex gap-2">
                      {errorCount > 0 && (
                        <span className="px-2 py-0.5 bg-danger/10 text-danger text-[11px] font-bold rounded-full">
                          {errorCount} error
                        </span>
                      )}
                      {warningCount > 0 && (
                        <span className="px-2 py-0.5 bg-yellow-500/10 text-yellow-700 text-[11px] font-bold rounded-full">
                          {warningCount} peringatan
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="max-h-[150px] overflow-y-auto">
                    {validationIssues.slice(0, 20).map((issue, idx) => (
                      <div key={idx} className={`px-6 py-2 text-[12px] flex items-center gap-2 border-b border-border-muted/50 last:border-0 ${
                        issue.severity === "error" ? "bg-danger/5 text-danger" : "bg-yellow-50 text-yellow-700"
                      }`}>
                        <span className="material-symbols-outlined text-[14px]">
                          {issue.severity === "error" ? "error" : "warning"}
                        </span>
                        <span className="font-mono">Baris {issue.row}</span>
                        <span>—</span>
                        <span className="font-medium">[{issue.field}]</span>
                        <span>{issue.message}</span>
                      </div>
                    ))}
                    {validationIssues.length > 20 && (
                      <p className="text-center py-2 text-text-secondary text-[11px]">...dan {validationIssues.length - 20} masalah lainnya</p>
                    )}
                  </div>
                </div>
              )}

              {/* File info & Action */}
              <div className="mt-6 flex items-center justify-between p-6 bg-surface-container-lowest rounded-xl border border-border-muted border-dashed">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 ${fileInfo ? 'bg-success/10 text-success' : 'bg-primary/5 text-primary'} rounded-lg flex items-center justify-center`}>
                    <span className="material-symbols-outlined">description</span>
                  </div>
                  <div>
                    <p className={`font-label-md text-label-md ${fileInfo ? 'text-success' : 'text-primary'}`}>
                      {fileInfo ? fileInfo.name : 'Belum ada file terpilih'}
                    </p>
                    <p className="font-body-md text-text-secondary text-xs">
                      {fileInfo 
                        ? `${fileInfo.size} — ${parsedRows.length} baris data terdeteksi${errorCount > 0 ? ` (${errorCount} error)` : ''}` 
                        : 'Silakan unggah berkas .csv Anda'}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={handleImport}
                  disabled={importing || parsedRows.length === 0}
                  className="bg-primary text-white px-10 py-4 rounded-xl font-label-md text-label-md hover:opacity-90 transition-all active:scale-95 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {importing ? (
                    <>
                      <span className="material-symbols-outlined text-sm animate-spin">sync</span>
                      MENGIMPOR... {progress}%
                    </>
                  ) : (
                    <>
                      IMPORT SEKARANG
                      <span className="material-symbols-outlined text-sm">send</span>
                    </>
                  )}
                </button>
              </div>

              {/* Progress Bar */}
              {importing && (
                <div className="mt-4">
                  <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-300 ease-out"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  <p className="text-[12px] text-text-secondary mt-2 text-center">Sedang mengimpor data ke database... {progress}%</p>
                </div>
              )}

              {/* CSV Preview Table */}
              {parsedRows.length > 0 && (
                <div className="mt-6 rounded-xl border border-border-muted overflow-hidden">
                  <div className="bg-surface-container-low px-6 py-3 border-b border-border-muted">
                    <p className="font-label-md text-label-md text-primary">Preview Data ({parsedRows.length} baris)</p>
                  </div>
                  <div className="overflow-x-auto max-h-[250px] overflow-y-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-surface-container-low border-b border-border-muted sticky top-0">
                          <th className="px-4 py-2 font-code-sm text-[11px] text-text-secondary uppercase">No</th>
                          <th className="px-4 py-2 font-code-sm text-[11px] text-text-secondary uppercase">Kategori</th>
                          <th className="px-4 py-2 font-code-sm text-[11px] text-text-secondary uppercase">No. Buku</th>
                          <th className="px-4 py-2 font-code-sm text-[11px] text-text-secondary uppercase">Judul</th>
                          <th className="px-4 py-2 font-code-sm text-[11px] text-text-secondary uppercase">Tahun</th>
                          <th className="px-4 py-2 font-code-sm text-[11px] text-text-secondary uppercase">Lemari</th>
                          <th className="px-4 py-2 font-code-sm text-[11px] text-text-secondary uppercase">Rak/Box</th>
                          <th className="px-4 py-2 font-code-sm text-[11px] text-text-secondary uppercase">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border-muted">
                        {parsedRows.slice(0, 20).map((row, i) => {
                          const rowIssues = validationIssues.filter(v => v.row === i + 2);
                          const hasError = rowIssues.some(v => v.severity === "error");
                          const hasWarning = rowIssues.some(v => v.severity === "warning");
                          
                          return (
                            <tr key={i} className={`hover:bg-surface-container-low text-sm ${hasError ? 'bg-danger/5' : hasWarning ? 'bg-yellow-50/50' : ''}`}>
                              <td className="px-4 py-2 text-text-secondary">{i + 1}</td>
                              <td className="px-4 py-2 text-text-primary">{row.kategori}</td>
                              <td className="px-4 py-2 font-code-sm text-primary">{row.noBuku || <span className="text-text-secondary italic">-</span>}</td>
                              <td className="px-4 py-2 text-text-primary">{row.judul || <span className="text-danger italic">Kosong!</span>}</td>
                              <td className="px-4 py-2 text-text-secondary">{row.tahun}</td>
                              <td className="px-4 py-2 text-text-secondary">{row.lemari}</td>
                              <td className="px-4 py-2 text-text-secondary">{row.rak}</td>
                              <td className="px-4 py-2">
                                {hasError ? (
                                  <span className="material-symbols-outlined text-[16px] text-danger">error</span>
                                ) : hasWarning ? (
                                  <span className="material-symbols-outlined text-[16px] text-yellow-600">warning</span>
                                ) : (
                                  <span className="material-symbols-outlined text-[16px] text-success">check_circle</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                    {parsedRows.length > 20 && (
                      <p className="text-center py-2 text-text-secondary text-xs">...dan {parsedRows.length - 20} baris lainnya</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Context Info Footer */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-start gap-4 p-4">
            <span className="material-symbols-outlined text-text-secondary">verified_user</span>
            <div>
              <p className="font-label-md text-label-md text-primary">Data Integrity</p>
              <p className="font-body-md text-text-secondary text-sm">Sistem melakukan validasi otomatis terhadap struktur kolom dan mendeteksi data duplikat.</p>
            </div>
          </div>
          <div className="flex items-start gap-4 p-4">
            <span className="material-symbols-outlined text-text-secondary">content_copy</span>
            <div>
              <p className="font-label-md text-label-md text-primary">Duplikat Handling</p>
              <p className="font-body-md text-text-secondary text-sm">Data dengan Nomor Buku yang sudah ada di database akan otomatis dilewati untuk mencegah data ganda.</p>
            </div>
          </div>
          <div className="flex items-start gap-4 p-4">
            <span className="material-symbols-outlined text-text-secondary">support_agent</span>
            <div>
              <p className="font-label-md text-label-md text-primary">Bantuan Teknis</p>
              <p className="font-body-md text-text-secondary text-sm">Hubungi tim IT Lakespra jika menemui kendala pada format CSV tertentu.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
