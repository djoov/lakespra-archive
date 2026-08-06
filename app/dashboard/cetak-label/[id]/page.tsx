"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { QRCodeSVG } from "qrcode.react";

type Book = {
  id: string;
  no: string;
  sku: string;
  title: string;
  loc: string;
  lemari: string;
  rak: string;
  kategori: string;
};

export default function CetakLabel() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [qrUrl, setQrUrl] = useState("");

  useEffect(() => {
    // Generate full URL for the QR code based on current domain
    if (typeof window !== "undefined") {
      setQrUrl(`${window.location.origin}/pencarian/${id}`);
    }

    const fetchBook = async () => {
      try {
        const docRef = doc(db, "books", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setBook({ id: docSnap.id, ...docSnap.data() } as Book);
        } else {
          alert("Dokumen tidak ditemukan!");
        }
      } catch (err) {
        console.error("Error fetching document:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBook();
  }, [id]);

  useEffect(() => {
    // Trigger print dialog once loaded
    if (!loading && book) {
      setTimeout(() => {
        window.print();
      }, 500); // Wait a tiny bit for QR to render
    }
  }, [loading, book]);

  if (loading) {
    return <div className="p-10 font-medium">Menyiapkan label...</div>;
  }

  if (!book) {
    return <div className="p-10 text-danger font-medium">Gagal memuat data. <button onClick={() => router.back()} className="underline text-primary ml-2">Kembali</button></div>;
  }

  return (
    <div className="bg-white min-h-screen">
      {/* 
        Print styling: 
        - Hide everything else if this is within a layout (though we might be in the dashboard layout, so we'll force full screen print)
        - But actually, we should ensure the dashboard layout doesn't interfere. 
        - We use @media print styles globally or here.
      */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * {
            visibility: hidden;
          }
          #print-area, #print-area * {
            visibility: visible;
          }
          #print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 0;
          }
          @page {
            size: auto;
            margin: 0mm;
          }
        }
      `}} />

      <div className="p-8 max-w-3xl mx-auto flex flex-col gap-4">
        <div className="mb-4">
          <button 
            onClick={() => window.print()}
            className="px-4 py-2 bg-primary text-white rounded-md font-medium text-sm no-print mr-2"
          >
            Print Lagi
          </button>
          <button 
            onClick={() => window.close()}
            className="px-4 py-2 bg-surface-container border border-border-muted text-text-primary rounded-md font-medium text-sm no-print"
          >
            Tutup
          </button>
        </div>

        {/* This is the actual label element that will be printed */}
        <div id="print-area" className="w-[10cm] border-2 border-black p-4 rounded-lg bg-white flex gap-4 items-center">
          {/* QR Code */}
          <div className="shrink-0 bg-white p-1 border-2 border-black rounded-md">
            <QRCodeSVG value={qrUrl} size={90} level="M" />
          </div>
          
          {/* Info */}
          <div className="flex-1 min-w-0 flex flex-col justify-center">
            <div className="flex items-center gap-1 mb-1 border-b border-black/20 pb-1">
              <img src="/logo.png" alt="Logo" className="w-4 h-4 grayscale" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-black">Lakespra Archive</span>
            </div>
            
            <p className="text-[16px] font-bold text-black leading-tight mb-1 font-display line-clamp-2">
              {book.title}
            </p>
            
            <div className="flex items-center justify-between mt-1">
              <div>
                <p className="text-[9px] text-black font-semibold uppercase">No. Arsip</p>
                <p className="text-[11px] font-code-sm font-bold text-black">{book.sku || book.no}</p>
              </div>
              <div className="text-right">
                <p className="text-[9px] text-black font-semibold uppercase">Lokasi</p>
                <p className="text-[11px] font-bold text-black">{book.lemari ? `${book.lemari} - ${book.rak}` : book.loc}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
