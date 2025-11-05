import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { MapPin, Truck, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { useState } from "react";

interface RouteStop {
  lokasi: string;
  estimasiWaktu: string;
}

interface RouteData {
  wilayah: string;
  rt: string;
  truk: string;
  jamBerangkat: string;
  rute: RouteStop[];
  totalEstimasi: string;
}

const routeData: RouteData[] = [
  {
    wilayah: "Wilayah A",
    rt: "RT 01",
    truk: "Truk A-01",
    jamBerangkat: "06:00",
    rute: [
      { lokasi: "Jl. Merpati No. 1-15", estimasiWaktu: "10 menit" },
      { lokasi: "Jl. Kenari No. 20-35", estimasiWaktu: "8 menit" },
      { lokasi: "Jl. Cendrawasih No. 5-12", estimasiWaktu: "7 menit" },
      { lokasi: "TPA Wilayah A", estimasiWaktu: "15 menit" }
    ],
    totalEstimasi: "40 menit"
  },
  {
    wilayah: "Wilayah A",
    rt: "RT 02",
    truk: "Truk A-02",
    jamBerangkat: "06:30",
    rute: [
      { lokasi: "Jl. Anggrek No. 1-20", estimasiWaktu: "12 menit" },
      { lokasi: "Jl. Melati No. 15-30", estimasiWaktu: "9 menit" },
      { lokasi: "Jl. Mawar No. 8-18", estimasiWaktu: "6 menit" },
      { lokasi: "TPA Wilayah A", estimasiWaktu: "15 menit" }
    ],
    totalEstimasi: "42 menit"
  },
  {
    wilayah: "Wilayah B",
    rt: "RT 01",
    truk: "Truk B-01",
    jamBerangkat: "07:00",
    rute: [
      { lokasi: "Jl. Flamboyan No. 5-25", estimasiWaktu: "11 menit" },
      { lokasi: "Jl. Dahlia No. 10-22", estimasiWaktu: "8 menit" },
      { lokasi: "Jl. Tulip No. 3-15", estimasiWaktu: "7 menit" },
      { lokasi: "TPA Wilayah B", estimasiWaktu: "18 menit" }
    ],
    totalEstimasi: "44 menit"
  },
  {
    wilayah: "Wilayah B",
    rt: "RT 02",
    truk: "Truk B-02",
    jamBerangkat: "07:30",
    rute: [
      { lokasi: "Jl. Seruni No. 2-18", estimasiWaktu: "10 menit" },
      { lokasi: "Jl. Teratai No. 12-28", estimasiWaktu: "9 menit" },
      { lokasi: "Jl. Kamboja No. 6-16", estimasiWaktu: "8 menit" },
      { lokasi: "TPA Wilayah B", estimasiWaktu: "18 menit" }
    ],
    totalEstimasi: "45 menit"
  },
  {
    wilayah: "Wilayah C",
    rt: "RT 01",
    truk: "Truk C-01",
    jamBerangkat: "06:00",
    rute: [
      { lokasi: "Jl. Mangga No. 1-12", estimasiWaktu: "9 menit" },
      { lokasi: "Jl. Rambutan No. 8-20", estimasiWaktu: "7 menit" },
      { lokasi: "Jl. Durian No. 4-14", estimasiWaktu: "6 menit" },
      { lokasi: "TPA Wilayah C", estimasiWaktu: "20 menit" }
    ],
    totalEstimasi: "42 menit"
  },
  {
    wilayah: "Wilayah C",
    rt: "RT 02",
    truk: "Truk C-02",
    jamBerangkat: "06:45",
    rute: [
      { lokasi: "Jl. Jambu No. 5-18", estimasiWaktu: "11 menit" },
      { lokasi: "Jl. Kelengkeng No. 2-15", estimasiWaktu: "8 menit" },
      { lokasi: "Jl. Manggis No. 9-22", estimasiWaktu: "7 menit" },
      { lokasi: "TPA Wilayah C", estimasiWaktu: "20 menit" }
    ],
    totalEstimasi: "46 menit"
  },
  {
    wilayah: "Wilayah D",
    rt: "RT 01",
    truk: "Truk D-01",
    jamBerangkat: "07:00",
    rute: [
      { lokasi: "Jl. Nangka No. 3-16", estimasiWaktu: "10 menit" },
      { lokasi: "Jl. Pepaya No. 7-19", estimasiWaktu: "8 menit" },
      { lokasi: "Jl. Salak No. 1-11", estimasiWaktu: "6 menit" },
      { lokasi: "TPA Wilayah D", estimasiWaktu: "22 menit" }
    ],
    totalEstimasi: "46 menit"
  },
  {
    wilayah: "Wilayah D",
    rt: "RT 02",
    truk: "Truk D-02",
    jamBerangkat: "07:45",
    rute: [
      { lokasi: "Jl. Belimbing No. 4-17", estimasiWaktu: "12 menit" },
      { lokasi: "Jl. Sirsak No. 10-24", estimasiWaktu: "9 menit" },
      { lokasi: "Jl. Sawo No. 6-15", estimasiWaktu: "7 menit" },
      { lokasi: "TPA Wilayah D", estimasiWaktu: "22 menit" }
    ],
    totalEstimasi: "50 menit"
  },
  {
    wilayah: "Wilayah E",
    rt: "RT 01",
    truk: "Truk E-01",
    jamBerangkat: "06:15",
    rute: [
      { lokasi: "Jl. Elang No. 2-14", estimasiWaktu: "10 menit" },
      { lokasi: "Jl. Rajawali No. 8-21", estimasiWaktu: "9 menit" },
      { lokasi: "Jl. Garuda No. 5-13", estimasiWaktu: "7 menit" },
      { lokasi: "TPA Wilayah E", estimasiWaktu: "17 menit" }
    ],
    totalEstimasi: "43 menit"
  },
  {
    wilayah: "Wilayah E",
    rt: "RT 02",
    truk: "Truk E-02",
    jamBerangkat: "07:00",
    rute: [
      { lokasi: "Jl. Bangau No. 1-16", estimasiWaktu: "11 menit" },
      { lokasi: "Jl. Merak No. 6-18", estimasiWaktu: "8 menit" },
      { lokasi: "Jl. Kakatua No. 3-12", estimasiWaktu: "6 menit" },
      { lokasi: "TPA Wilayah E", estimasiWaktu: "17 menit" }
    ],
    totalEstimasi: "42 menit"
  },
  {
    wilayah: "Wilayah F",
    rt: "RT 01",
    truk: "Truk F-01",
    jamBerangkat: "06:30",
    rute: [
      { lokasi: "Jl. Kelapa No. 4-19", estimasiWaktu: "13 menit" },
      { lokasi: "Jl. Aren No. 9-23", estimasiWaktu: "10 menit" },
      { lokasi: "Jl. Palem No. 2-14", estimasiWaktu: "8 menit" },
      { lokasi: "TPA Wilayah F", estimasiWaktu: "19 menit" }
    ],
    totalEstimasi: "50 menit"
  },
  {
    wilayah: "Wilayah F",
    rt: "RT 02",
    truk: "Truk F-02",
    jamBerangkat: "07:15",
    rute: [
      { lokasi: "Jl. Pinus No. 5-17", estimasiWaktu: "11 menit" },
      { lokasi: "Jl. Cemara No. 8-20", estimasiWaktu: "9 menit" },
      { lokasi: "Jl. Akasia No. 1-13", estimasiWaktu: "7 menit" },
      { lokasi: "TPA Wilayah F", estimasiWaktu: "19 menit" }
    ],
    totalEstimasi: "46 menit"
  }
];

const Jadwal = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  
  const totalPages = Math.ceil(routeData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = routeData.slice(startIndex, endIndex);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold mb-3 text-foreground">Jadwal & Rute Truk Sampah</h1>
            <p className="text-muted-foreground text-lg">
              Informasi rute dan estimasi waktu pengambilan sampah per wilayah dan RT
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {currentData.map((route, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-primary" />
                        <CardTitle className="text-xl">{route.wilayah}</CardTitle>
                      </div>
                      <CardDescription className="flex items-center gap-3">
                        <Badge variant="outline">{route.rt}</Badge>
                        <span className="flex items-center gap-1">
                          <Truck className="h-3 w-3" />
                          {route.truk}
                        </span>
                      </CardDescription>
                    </div>
                    <Badge className="bg-primary">
                      {route.jamBerangkat}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Rute Perjalanan:
                    </p>
                    <div className="space-y-2 ml-6">
                      {route.rute.map((stop, stopIndex) => (
                        <div key={stopIndex} className="flex items-start justify-between gap-2 pb-2 border-b last:border-0">
                          <div className="flex-1">
                            <p className="text-sm text-foreground font-medium">
                              {stopIndex + 1}. {stop.lokasi}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <p className="text-xs whitespace-nowrap">{stop.estimasiWaktu}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-foreground">Total Estimasi</p>
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {route.totalEstimasi}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-8">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        onClick={() => setCurrentPage(page)}
                        isActive={currentPage === page}
                        className="cursor-pointer"
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}

          <Card className="mt-8 p-6 bg-accent/30">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <span className="text-primary">ℹ️</span> Informasi Penting
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Sampah harus sudah disiapkan di depan rumah sebelum truk tiba</li>
              <li>• Pisahkan sampah organik dan non-organik</li>
              <li>• Pastikan sampah dikemas dengan baik dalam kantong/karung</li>
              <li>• Waktu bisa berubah tergantung kondisi lalu lintas dan cuaca</li>
              <li>• Untuk pertanyaan lebih lanjut, hubungi hotline kami</li>
            </ul>
          </Card>

          <div className="mt-6 p-4 bg-primary/10 rounded-lg text-center">
            <p className="text-sm">
              <strong>Wilayah Anda tidak terdaftar?</strong><br />
              Silakan hubungi kami melalui halaman kontak untuk informasi lebih lanjut
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Jadwal;
