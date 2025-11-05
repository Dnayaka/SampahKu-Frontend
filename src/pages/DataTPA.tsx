import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { useState } from "react";

const tpaData = [
  {
    kota: "Jakarta",
    lokasi: "TPA Bantar Gebang",
    jumlahSampah: 7500,
    satuan: "ton/hari",
    kapasitas: 85,
    trend: "up"
  },
  {
    kota: "Purwokerto",
    lokasi: "TPA Gunung Tugel",
    jumlahSampah: 250,
    satuan: "ton/hari",
    kapasitas: 65,
    trend: "down"
  },
  {
    kota: "Surabaya",
    lokasi: "TPA Benowo",
    jumlahSampah: 2100,
    satuan: "ton/hari",
    kapasitas: 78,
    trend: "up"
  },
  {
    kota: "Bandung",
    lokasi: "TPA Sarimukti",
    jumlahSampah: 1800,
    satuan: "ton/hari",
    kapasitas: 72,
    trend: "stable"
  },
  {
    kota: "Semarang",
    lokasi: "TPA Jatibarang",
    jumlahSampah: 900,
    satuan: "ton/hari",
    kapasitas: 68,
    trend: "down"
  },
  {
    kota: "Yogyakarta",
    lokasi: "TPA Piyungan",
    jumlahSampah: 550,
    satuan: "ton/hari",
    kapasitas: 80,
    trend: "up"
  },
  {
    kota: "Medan",
    lokasi: "TPA Namo Bintang",
    jumlahSampah: 1300,
    satuan: "ton/hari",
    kapasitas: 75,
    trend: "up"
  },
  {
    kota: "Makassar",
    lokasi: "TPA Tamangapa",
    jumlahSampah: 800,
    satuan: "ton/hari",
    kapasitas: 70,
    trend: "stable"
  },
  {
    kota: "Palembang",
    lokasi: "TPA Sukawinatan",
    jumlahSampah: 700,
    satuan: "ton/hari",
    kapasitas: 73,
    trend: "down"
  },
  {
    kota: "Malang",
    lokasi: "TPA Supiturang",
    jumlahSampah: 600,
    satuan: "ton/hari",
    kapasitas: 66,
    trend: "stable"
  },
  {
    kota: "Denpasar",
    lokasi: "TPA Suwung",
    jumlahSampah: 850,
    satuan: "ton/hari",
    kapasitas: 82,
    trend: "up"
  },
  {
    kota: "Tangerang",
    lokasi: "TPA Rawa Kucing",
    jumlahSampah: 1100,
    satuan: "ton/hari",
    kapasitas: 77,
    trend: "down"
  }
];

const DataTPA = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  
  const totalPages = Math.ceil(tpaData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = tpaData.slice(startIndex, endIndex);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-destructive" />;
      case "down":
        return <TrendingDown className="h-4 w-4 text-green-600" />;
      default:
        return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getTrendBadge = (trend: string) => {
    switch (trend) {
      case "up":
        return <Badge variant="destructive">Meningkat</Badge>;
      case "down":
        return <Badge className="bg-green-600 hover:bg-green-700">Menurun</Badge>;
      default:
        return <Badge variant="secondary">Stabil</Badge>;
    }
  };

  const getCapacityColor = (capacity: number) => {
    if (capacity >= 80) return "text-destructive";
    if (capacity >= 70) return "text-yellow-600";
    return "text-green-600";
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold mb-3 text-foreground">Data TPA Indonesia</h1>
            <p className="text-muted-foreground text-lg">
              Pantau jumlah sampah di berbagai Tempat Pemrosesan Akhir di seluruh Indonesia
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {currentData.map((tpa, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-primary" />
                      <CardTitle className="text-xl">{tpa.kota}</CardTitle>
                    </div>
                    {getTrendIcon(tpa.trend)}
                  </div>
                  <CardDescription>{tpa.lokasi}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Jumlah Sampah</p>
                    <p className="text-3xl font-bold text-foreground">
                      {tpa.jumlahSampah.toLocaleString('id-ID')}
                    </p>
                    <p className="text-sm text-muted-foreground">{tpa.satuan}</p>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-muted-foreground">Kapasitas</p>
                      <p className={`text-sm font-semibold ${getCapacityColor(tpa.kapasitas)}`}>
                        {tpa.kapasitas}%
                      </p>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          tpa.kapasitas >= 80
                            ? "bg-destructive"
                            : tpa.kapasitas >= 70
                            ? "bg-yellow-600"
                            : "bg-green-600"
                        }`}
                        style={{ width: `${tpa.kapasitas}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <p className="text-sm text-muted-foreground">Tren</p>
                    {getTrendBadge(tpa.trend)}
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
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default DataTPA;
