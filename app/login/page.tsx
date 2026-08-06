"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/dashboard");
    } catch (error: any) {
      let message = "Kredensial tidak valid atau terjadi kesalahan sistem.";
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
        message = "Email atau password yang Anda masukkan salah.";
      } else if (error.code === 'auth/too-many-requests') {
        message = "Terlalu banyak percobaan gagal. Silakan coba lagi nanti.";
      }
      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-surface">
      {/* Dynamic Background Elements for Premium Feel */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary-container/30 rounded-full mix-blend-multiply filter blur-[120px] opacity-70 animate-blob"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary-container/20 rounded-full mix-blend-multiply filter blur-[100px] opacity-60 animate-blob animation-delay-2000"></div>
        
        {/* Floating Military & Medical Icons */}
        <span className="material-symbols-outlined absolute top-[5%] left-[5%] text-[240px] text-primary opacity-20 -rotate-12 select-none pointer-events-none" style={{ fontVariationSettings: "'FILL' 1, 'wght' 700" }}>local_hospital</span>
        <span className="material-symbols-outlined absolute top-[60%] left-[5%] text-[200px] text-secondary opacity-20 rotate-12 select-none pointer-events-none" style={{ fontVariationSettings: "'FILL' 1, 'wght' 700" }}>shield</span>
        <span className="material-symbols-outlined absolute top-[10%] right-[5%] text-[220px] text-primary opacity-20 rotate-45 select-none pointer-events-none" style={{ fontVariationSettings: "'FILL' 1, 'wght' 700" }}>flight_takeoff</span>
        <span className="material-symbols-outlined absolute bottom-[5%] right-[5%] text-[260px] text-secondary opacity-20 -rotate-12 select-none pointer-events-none" style={{ fontVariationSettings: "'FILL' 1, 'wght' 700" }}>health_and_safety</span>
        <span className="material-symbols-outlined absolute top-[45%] right-[10%] text-[180px] text-primary opacity-20 -rotate-45 select-none pointer-events-none" style={{ fontVariationSettings: "'FILL' 1, 'wght' 700" }}>military_tech</span>
      </div>
      
      {/* Main Content Canvas */}
      <main className="z-10 w-full max-w-[380px] px-6 md:px-0 flex flex-col items-center">
        
        {/* Login Card */}
        <div className="w-full bg-white/70 backdrop-blur-xl border border-white/50 rounded-2xl p-7 shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all duration-300">
          {/* Logo Section */}
          <div className="flex flex-col items-center mb-8">
            <img src="/logo.png" alt="Lakespra Logo" className="w-16 h-16 mb-4 object-contain" />
            <h1 className="font-display text-[24px] font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent tracking-tight text-center">Lakespra Archive</h1>
            <p className="font-sans text-[12px] font-bold text-text-secondary mt-1 text-center uppercase tracking-wider">Internal Access Only</p>
          </div>
          
          {/* Form */}
          <form className="space-y-5" onSubmit={handleLogin}>
            {errorMsg && (
              <div className="p-3 rounded-lg bg-danger/10 border border-danger/20 text-danger text-[13px] font-medium flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">error</span>
                {errorMsg}
              </div>
            )}
            
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="block font-label-md text-[13px] text-text-primary" htmlFor="email">Alamat Email</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary/70 text-[18px]">mail</span>
                <input 
                  className="w-full pl-9 pr-4 py-2.5 bg-white/60 border border-white/60 rounded-xl font-body-sm text-body-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all shadow-sm" 
                  id="email" 
                  name="email" 
                  placeholder="nama@lakespra.go.id" 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            
            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="block font-label-md text-[13px] text-text-primary" htmlFor="password">Kata Sandi</label>
              </div>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary/70 text-[18px]">lock</span>
                <input 
                  className="w-full pl-9 pr-10 py-2.5 bg-white/60 border border-white/60 rounded-xl font-body-sm text-body-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all shadow-sm" 
                  id="password" 
                  name="password" 
                  placeholder="••••••••" 
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button 
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary/70 hover:text-primary focus:outline-none transition-colors" 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </div>
            
            {/* Submit Button */}
            <button 
              className="w-full mt-2 bg-gradient-to-r from-primary to-secondary text-white font-label-md text-[13px] tracking-wider py-3.5 rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all active:scale-[0.98] transform flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none" 
              type="submit"
              disabled={loading}
            >
              {loading ? "MEMPROSES..." : "MASUK SISTEM"}
              {!loading && <span className="material-symbols-outlined text-[18px]">arrow_forward</span>}
            </button>
          </form>
        </div>
        
        {/* Footer / Technical Info */}
        <footer className="mt-8 text-center">
          <div className="flex justify-center gap-4 opacity-40 hover:opacity-100 grayscale hover:grayscale-0 transition-all duration-500 mb-3">
            <img 
              className="h-7 w-auto" 
              alt="Indonesian military medical corps logo" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAT9am1qqU_DNjLrw4hc6-SQI43z0iHJSLS24Zm1QqzOiUSBnkNj1wl0XBJb-JoctDIvl-q38PN1OuPoYuPds0dGa8UNH-PgJ6FjsMylvkmwJi09lBYIamXNyX5knKCgOyLiryLR0gLZruIKbOn0ddbv3ABLi50c5YL2ppFA2JE97CN4_NU77DN-dlcAvMPjfH6FUbh3C7KH1r0izInRWVTxHEDnHsuImqyYrA1Kti0Xh0TbZqcJWc7PQJI-kiBEbqSAP_4xCZz8bY"
            />
            <img 
              className="h-7 w-auto" 
              alt="Lakespra institution logo" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDKDTp0wdWJCNFbQp94Jx4WLU26mHEIYXJl6xeNMRw8dKU-Tnkb-JvMuqyNw-wjQaNPX3wl2dfi2YRDehy9XyPINJaUZtnbLds6LAh24LLA-n2E9YlBcHiNeWKvPf2YjNXkbglgQjDJ4YJY0d__RW4DOU00sq01kPPyAE5XO15AwsIu0Pqz5FokdqwYf_-zEIOsfdz29Q8ei5Mh9_zju09yUrU8gtbwAfCluB2vtz89oGR6YXxK9IyYE6sV5ZReCicpLr73DOAKA8k"
            />
          </div>
          <p className="font-code-sm text-[10px] text-text-secondary/60 uppercase tracking-widest">
            Sistem Informasi Arsip Internal v2.4
          </p>
        </footer>
      </main>
    </div>
  );
}
