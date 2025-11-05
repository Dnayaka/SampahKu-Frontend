import { Link } from "react-router-dom";
import { Calendar, Phone, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import EarthRecycle from "@/components/EarthRecycle";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary/10 via-secondary/20 to-accent py-16 md:py-24">
          <div className="container mx-auto px-4 text-center">
            <div className="flex justify-center mb-8">
              <EarthRecycle />
            </div>
            <h1 className="text-3xl md:text-5xl font-bold mb-4 animate-fade-in">
              Pengumpulan Sampah Warga ke TPA
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 animate-fade-in">
              Layanan jemput sampah yang mudah dan terpercaya untuk lingkungan yang lebih bersih
            </p>
            <Link to="/daftar">
              <Button size="lg" className="text-lg px-8 py-6 hover:scale-105 transition-transform">
                Daftar Jemput Sampah Sekarang
              </Button>
            </Link>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-12 md:py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-center mb-12">Layanan Kami</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Link to="/daftar" className="block hover:scale-105 transition-transform">
                <Card className="p-6 h-full hover:shadow-lg transition-shadow">
                  <div className="flex flex-col items-center text-center gap-4">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                      <FileText className="w-8 h-8 text-primary" />
                    </div>
                    <h3>Daftar Jemput Sampah</h3>
                    <p className="text-muted-foreground">
                      Daftarkan alamat Anda untuk dijemput petugas pengumpul sampah
                    </p>
                  </div>
                </Card>
              </Link>

              <Link to="/jadwal" className="block hover:scale-105 transition-transform">
                <Card className="p-6 h-full hover:shadow-lg transition-shadow">
                  <div className="flex flex-col items-center text-center gap-4">
                    <div className="w-16 h-16 bg-secondary/20 rounded-full flex items-center justify-center">
                      <Calendar className="w-8 h-8 text-primary" />
                    </div>
                    <h3>Lihat Jadwal</h3>
                    <p className="text-muted-foreground">
                      Cek jadwal pengumpulan sampah di wilayah Anda
                    </p>
                  </div>
                </Card>
              </Link>

              <Link to="/kontak" className="block hover:scale-105 transition-transform">
                <Card className="p-6 h-full hover:shadow-lg transition-shadow">
                  <div className="flex flex-col items-center text-center gap-4">
                    <div className="w-16 h-16 bg-accent/30 rounded-full flex items-center justify-center">
                      <Phone className="w-8 h-8 text-primary" />
                    </div>
                    <h3>Kontak Petugas</h3>
                    <p className="text-muted-foreground">
                      Hubungi petugas jika ada pertanyaan atau keluhan
                    </p>
                  </div>
                </Card>
              </Link>
            </div>
          </div>
        </section>

        {/* Info Section */}
        <section className="bg-accent/30 py-12 md:py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="mb-6">Cara Menggunakan Layanan</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-xl">
                  1
                </div>
                <h3 className="text-lg font-semibold">Daftar</h3>
                <p className="text-muted-foreground text-sm">
                  Isi formulir pendaftaran dengan nama, alamat, dan nomor HP
                </p>
              </div>
              
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-xl">
                  2
                </div>
                <h3 className="text-lg font-semibold">Tunggu Konfirmasi</h3>
                <p className="text-muted-foreground text-sm">
                  Petugas akan menghubungi untuk konfirmasi jadwal penjemputan
                </p>
              </div>
              
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-xl">
                  3
                </div>
                <h3 className="text-lg font-semibold">Siapkan Sampah</h3>
                <p className="text-muted-foreground text-sm">
                  Siapkan sampah di depan rumah sesuai jadwal yang ditentukan
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
