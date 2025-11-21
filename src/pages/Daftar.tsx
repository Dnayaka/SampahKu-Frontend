import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { FileText } from "lucide-react";

const Daftar = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    nama: "",
    alamat: "",
    nomorHp: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validasi sederhana
    if (!formData.nama || !formData.alamat || !formData.nomorHp) {
      toast({
        title: "Form Belum Lengkap",
        description: "Mohon isi semua kolom yang tersedia",
        variant: "destructive",
      });
      return;
    }

    // Buat pesan WA
    const message = `Halo! Saya ingin daftar layanan jemput sampah.%0A%0A` +
      `Nama: ${encodeURIComponent(formData.nama)}%0A` +
      `Alamat: ${encodeURIComponent(formData.alamat)}%0A` +
      `Nomor HP: ${encodeURIComponent(formData.nomorHp)}%0A%0A` +
      `Mohon konfirmasi jadwal penjemputan. Terima kasih!`;

    // Nomor WhatsApp (ubah ke format internasional tanpa 0 di depan)
    const waNumber = process.env.NEXT_PUBLIC_WA_NUMBER

    // Buka WhatsApp
    const waUrl = `https://wa.me/${waNumber}?text=${message}`;
    window.open(waUrl, "_blank");

    toast({
      title: "Membuka WhatsApp...",
      description: "Anda akan diarahkan untuk mengirim pesan ke petugas kami",
    });

    // Reset form dan kembali ke halaman utama
    setFormData({ nama: "", alamat: "", nomorHp: "" });
    setTimeout(() => navigate("/"), 2000);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 py-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <FileText className="w-8 h-8 text-primary" />
              </div>
            </div>
            <h1 className="mb-2">Daftar Jemput Sampah</h1>
            <p className="text-muted-foreground">
              Isi formulir di bawah ini untuk mendaftar layanan penjemputan sampah
            </p>
          </div>

          <Card className="p-6 md:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="nama" className="text-base font-semibold">
                  Nama Lengkap <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="nama"
                  type="text"
                  placeholder="Masukkan nama lengkap Anda"
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  className="h-12 text-base"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="alamat" className="text-base font-semibold">
                  Alamat Lengkap <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="alamat"
                  placeholder="Masukkan alamat lengkap rumah Anda (termasuk RT/RW jika ada)"
                  value={formData.alamat}
                  onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                  className="min-h-24 text-base"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nomorHp" className="text-base font-semibold">
                  Nomor HP/WhatsApp <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="nomorHp"
                  type="tel"
                  placeholder="Contoh: 081234567890"
                  value={formData.nomorHp}
                  onChange={(e) => setFormData({ ...formData, nomorHp: e.target.value })}
                  className="h-12 text-base"
                  required
                />
                <p className="text-sm text-muted-foreground">
                  Nomor HP yang bisa dihubungi untuk konfirmasi
                </p>
              </div>

              <div className="pt-4">
                <Button 
                  type="submit" 
                  size="lg" 
                  className="w-full h-12 text-base hover:scale-105 transition-transform"
                >
                  Kirim Pendaftaran via WhatsApp
                </Button>
              </div>
            </form>
          </Card>

          <div className="mt-6 p-4 bg-accent/30 rounded-lg">
            <p className="text-sm text-center text-muted-foreground">
              <strong>Catatan:</strong> Setelah menekan tombol, Anda akan diarahkan ke WhatsApp
              untuk mengirim pesan ke petugas kami.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Daftar;
