"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginAdmin } from "@/lib/auth";
import { Button, FormInput, FormLabel } from "@/components/ui";
import { Lock, User, ShieldAlert, Loader2, Eye, EyeOff } from "lucide-react";

export default function AdminLoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!username || !password) {
      setError("Username dan password harus diisi.");
      return;
    }

    setIsLoading(true);
    try {
      const success = await loginAdmin(username, password);
      if (success) {
        router.push("/admin");
      } else {
        setError("Username atau password salah!");
      }
    } catch (err) {
      console.error(err);
      setError("Terjadi kesalahan saat mencoba login.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary-950 flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Background decoration blur accents */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary-700/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-accent-blue-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-white rounded-[2.5rem] border-2 border-primary-900 p-8 sm:p-10 shadow-[8px_8px_0_var(--color-primary-900)] relative z-10">
        
        {/* Header Logo & Title */}
        <div className="flex flex-col items-center text-center mb-8">
          <h1 className="text-2xl font-display font-black text-primary-900 tracking-tight">
            Admin Gemasix
          </h1>
          <p className="text-sm text-neutral-500 font-medium mt-1">
            Login untuk  mengakses dashboard admin
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm font-semibold flex items-center gap-3">
            <ShieldAlert size={20} className="shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          <div>
            <FormLabel htmlFor="username" required>Username</FormLabel>
            <div className="relative">
              <FormInput
                id="username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Masukkan username..."
                className="pl-10"
              />
              <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
            </div>
          </div>

          <div>
            <FormLabel htmlFor="password" required>Password</FormLabel>
            <div className="relative">
              <FormInput
                id="password"
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password..."
                className="pl-10 pr-10"
              />
              <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-primary-900 transition-colors"
                aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <Button
            as="button"
            type="submit"
            variant="primary"
            disabled={isLoading}
            className="w-full justify-center py-3.5 mt-2 text-base font-bold"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 size={20} className="animate-spin" /> Memeriksa Login...
              </span>
            ) : (
              "Masuk ke Dashboard"
            )}
          </Button>
        </form>

        <div className="mt-8 text-center border-t border-neutral-100 pt-6">
          <a href="/" className="text-xs font-bold text-neutral-400 hover:text-primary-900 transition-colors">
            &larr; Kembali ke Website Utama
          </a>
        </div>
      </div>
    </div>
  );
}