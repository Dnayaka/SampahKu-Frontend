import { Card } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Phone, Mail, MapPin, Clock, MessageSquare } from "lucide-react";

const Kontak = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <Phone className="w-8 h-8 text-primary" />
              </div>
            </div>
            <h1 className="mb-2">Hubungi Kami</h1>
            <p className="text-muted-foreground">
              Kami siap membantu Anda. Jangan ragu untuk menghubungi kami
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex flex-col items-center text-center gap-4">
                <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center">
                  <Phone className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Telepon / WhatsApp</h3>
                  <a 
                    href="tel:08001234567" 
                    className="text-lg font-medium text-primary hover:underline"
                  >
                    0800-123-4567
                  </a>
                  <p className="text-sm text-muted-foreground mt-1">
                    Hotline 24 jam
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex flex-col items-center text-center gap-4">
                <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center">
                  <Mail className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Email</h3>
                  <a 
                    href="mailto:info@tpadaerah.id" 
                    className="text-lg font-medium text-primary hover:underline"
                  >
                    info@tpadaerah.id
                  </a>
                  <p className="text-sm text-muted-foreground mt-1">
                    Respon dalam 1x24 jam
                  </p>
                </div>
              </div>
            </Card>
          </div>

          <Card className="p-6 mb-6">
            <div className="flex flex-col gap-4">
              <div className="flex items-start gap-4">
                <MapPin className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold mb-1">Alamat Kantor</h3>
                  <p className="text-muted-foreground">
                    Jl. TPA Daerah No. 123<br />
                    Kelurahan Bersih, Kota Sejahtera<br />
                    Kode Pos: 12345
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Clock className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold mb-1">Jam Operasional</h3>
                  <p className="text-muted-foreground">
                    Senin - Jumat: 08:00 - 16:00<br />
                    Sabtu: 08:00 - 12:00<br />
                    Minggu & Libur: Tutup
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-accent/30">
            <div className="flex items-start gap-4">
              <MessageSquare className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold mb-2">Layanan Pengaduan</h3>
                <p className="text-muted-foreground mb-3">
                  Jika Anda memiliki keluhan atau masukan terkait layanan pengumpulan sampah, 
                  silakan hubungi kami melalui:
                </p>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Hotline: 0800-123-4567 (tekan 2 untuk pengaduan)</li>
                  <li>• Email: layanan@tpadaerah.id</li>
                  <li>• WhatsApp: 0812-3456-7890</li>
                </ul>
              </div>
            </div>
          </Card>

          <div className="mt-6 p-4 bg-primary/10 rounded-lg text-center">
            <p className="text-sm font-medium">
              💚 Terima kasih telah menggunakan layanan kami untuk lingkungan yang lebih bersih
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Kontak;
