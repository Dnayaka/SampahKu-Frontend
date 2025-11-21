import { useState, useEffect, useMemo } from "react";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { 
  Eye, 
  Search, 
  Users, 
  CheckCircle, 
  XCircle, 
  Phone, 
  MapPin, 
  Plus,
  CreditCard,
  Loader2,
  RefreshCw,
  AlertCircle,
  Calendar
} from "lucide-react";
import { toast } from "sonner";

// Tipe data sesuai response API
interface AlamatAktif {
  lokasi_alamat: string;
  latitude: number;
  longitude: number;
}

interface TagihanItem {
  id_tagihan: number;
  total_tagihan: number;
  periode_tagihan: string;
  status_bayar: boolean;
  expired_at: string;
  created_at: string;
}

interface UserData {
  id_user: number;
  nama: string;
  no_telepon: string;
  ada_tagihan: boolean;
  tagihan: TagihanItem[];
  alamat_aktif: AlamatAktif[];
}

interface TpaTagihanResponse {
  tpa_id: number;
  nama_tpa: string;
  total_user: number;
  users: UserData[];
}

interface Pelanggan {
  id: string;
  nama: string;
  alamat: string;
  statusPembayaran: "Lunas" | "Belum Bayar" | "Tidak Ada Tagihan";
  telepon: string;
  tagihan: string;
  ada_tagihan: boolean;
  tagihan_list: TagihanItem[];
  originalData: UserData;
}

// Fungsi untuk mendapatkan cookie by name
const getCookie = (name: string): string | null => {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
};

const Pelanggan = () => {
  const [pelangganData, setPelangganData] = useState<Pelanggan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPelanggan, setSelectedPelanggan] = useState<Pelanggan | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"Semua" | "Lunas" | "Belum Bayar" | "Tidak Ada Tagihan">("Semua");
  const [currentPage, setCurrentPage] = useState(1);
  const [generatingTagihan, setGeneratingTagihan] = useState<number | null>(null);
  const [processingPembayaran, setProcessingPembayaran] = useState<number | null>(null);
  const [selectedPeriode, setSelectedPeriode] = useState<"minggu" | "bulan" | "tahun">("bulan");
  const [nominalTagihan, setNominalTagihan] = useState<string>("");
  const [showBuatTagihanForm, setShowBuatTagihanForm] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const itemsPerPage = 5;

  // Format nominal ke Rupiah
  const formatRupiah = (angka: string): string => {
    const number = angka.replace(/\D/g, "");
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(Number(number));
  };

  // Handle input nominal
  const handleNominalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    setNominalTagihan(value);
  };

  // Fungsi untuk konversi UTC ke WIB (UTC+7)
  const convertUTCtoWIB = (utcDateString: string): Date => {
    const date = new Date(utcDateString);
    // Tambah 7 jam untuk WIB
    date.setHours(date.getHours() + 7);
    return date;
  };

  // Format tanggal ke WIB
  const formatTanggalWIB = (tanggal: string) => {
    try {
      const dateWIB = convertUTCtoWIB(tanggal);
      return dateWIB.toLocaleDateString('id-ID', {
        timeZone: 'Asia/Jakarta',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return "Tanggal tidak valid";
    }
  };

  // Format tanggal hanya tanggal (tanpa jam) untuk tampilan sederhana
  const formatTanggalSederhana = (tanggal: string) => {
    try {
      const dateWIB = convertUTCtoWIB(tanggal);
      return dateWIB.toLocaleDateString('id-ID', {
        timeZone: 'Asia/Jakarta',
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch (error) {
      return "Tanggal tidak valid";
    }
  };

  // Cek apakah tanggal sudah lewat (untuk status terlambat)
  const isTanggalTerlambat = (tanggal: string): boolean => {
    try {
      const dateWIB = convertUTCtoWIB(tanggal);
      const sekarang = new Date();
      // Set waktu sekarang ke WIB
      sekarang.setHours(sekarang.getHours() + 7);
      return dateWIB < sekarang;
    } catch (error) {
      return false;
    }
  };

  // Fungsi untuk mendapatkan info TPA dari cookies
  const getTpaInfo = () => {
    const userInfoCookie = getCookie("user_info");
    const token = getCookie("access_token");

    if (!token) {
      throw new Error("Token akses tidak ditemukan. Silakan login kembali.");
    }

    let tpaId = 1;
    let namaTpa = "TPA Default";

    if (userInfoCookie) {
      try {
        const userInfo = JSON.parse(userInfoCookie);
        tpaId = userInfo?.tpa_list?.[0]?.id_tpa || 1;
        namaTpa = userInfo?.tpa_list?.[0]?.nama_tpa || "TPA Default";
      } catch (err) {
        console.error("Gagal parsing cookie user_info:", err);
      }
    }

    return { tpaId, token, namaTpa };
  };

  // Fetch data pelanggan
  const fetchPelangganData = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      setRefreshing(true);

      const { tpaId, token } = getTpaInfo();

      console.log("🔄 Fetching data pelanggan untuk TPA:", tpaId);

      const response = await fetch(`http://${process.env.NEXT_PUBLIC_API_URL}/tpa/tagihan/${tpaId}/all-users`, {
        headers: { 
          accept: 'application/json',
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Response error:', errorText);
        throw new Error(`Gagal mengambil data: ${response.status} ${response.statusText}`);
      }

      const tagihanData: TpaTagihanResponse = await response.json();
      
      console.log("📊 Data response API:", tagihanData);

      // Transform data ke format Pelanggan
      const transformedData: Pelanggan[] = tagihanData.users.map((user: UserData) => {
        // Tentukan status pembayaran berdasarkan tagihan
        let statusPembayaran: "Lunas" | "Belum Bayar" | "Tidak Ada Tagihan" = "Tidak Ada Tagihan";
        let tagihanText = "Tidak ada tagihan";
        let totalTagihan = 0;

        if (user.ada_tagihan && user.tagihan && user.tagihan.length > 0) {
          // Cari tagihan yang belum dibayar
          const tagihanBelumBayar = user.tagihan.filter(t => !t.status_bayar);
          
          if (tagihanBelumBayar.length > 0) {
            statusPembayaran = "Belum Bayar";
            totalTagihan = tagihanBelumBayar.reduce((sum, t) => sum + t.total_tagihan, 0);
            tagihanText = `Rp ${totalTagihan.toLocaleString('id-ID')}`;
          } else {
            // Semua tagihan sudah lunas
            statusPembayaran = "Lunas";
            tagihanText = "Semua Lunas";
          }
        }

        return {
          id: user.id_user.toString(),
          nama: user.nama,
          alamat: user.alamat_aktif.length > 0 ? user.alamat_aktif[0].lokasi_alamat : "Tidak ada alamat",
          statusPembayaran,
          telepon: user.no_telepon,
          tagihan: tagihanText,
          ada_tagihan: user.ada_tagihan,
          tagihan_list: user.tagihan || [],
          originalData: user
        };
      });

      console.log("✅ Data pelanggan berhasil di-transform:", transformedData);
      setPelangganData(transformedData);
      toast.success("Data pelanggan berhasil dimuat");
      
    } catch (error) {
      console.error('❌ Gagal fetch data pelanggan:', error);
      toast.error(error instanceof Error ? error.message : "Gagal memuat data pelanggan");
      setPelangganData([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Load data pertama kali
  useEffect(() => {
    fetchPelangganData();
  }, []);

  // Fungsi untuk membuat tagihan dengan nominal custom
  const buatTagihan = async (userId: number, nominal: number) => {
    try {
      setGeneratingTagihan(userId);
      
      const { tpaId, token } = getTpaInfo();

      // Siapkan data untuk request
      const tagihanData = {
        id_user: userId,
        id_tpa: tpaId,
        total_tagihan: nominal,
        periode_tagihan: selectedPeriode,
        status_bayar: false
      };

      console.log("📤 Membuat tagihan:", tagihanData);

      const response = await fetch(`http://${process.env.NEXT_PUBLIC_API_URL}/financial/tagihan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(tagihanData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error response:', errorText);
        throw new Error('Gagal membuat tagihan');
      }

      const result = await response.json();
      console.log('✅ Tagihan berhasil dibuat:', result);

      // Refresh data setelah berhasil membuat tagihan
      await fetchPelangganData(false);
      setShowBuatTagihanForm(false);
      setNominalTagihan("");
      toast.success("Tagihan berhasil dibuat!");
      
    } catch (error) {
      console.error('❌ Error membuat tagihan:', error);
      toast.error("Gagal membuat tagihan. Silakan coba lagi.");
    } finally {
      setGeneratingTagihan(null);
    }
  };

  // Fungsi untuk memproses pembayaran
  const prosesPembayaran = async (tagihanId: number) => {
    try {
      setProcessingPembayaran(tagihanId);
      
      const { token } = getTpaInfo();

      console.log("💳 Memproses pembayaran tagihan:", tagihanId);

      const response = await fetch(
        `http://${process.env.NEXT_PUBLIC_API_URL}/financial/tagihan/bayar`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'accept': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ id_tagihan: tagihanId })
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error response:', errorText);
        throw new Error('Gagal memproses pembayaran');
      }

      const result = await response.json();
      console.log('✅ Pembayaran berhasil:', result);

      // Refresh data setelah berhasil pembayaran
      await fetchPelangganData(false);
      toast.success("Pembayaran berhasil diproses!");
      
    } catch (error) {
      console.error('❌ Error memproses pembayaran:', error);
      toast.error("Gagal memproses pembayaran. Silakan coba lagi.");
    } finally {
      setProcessingPembayaran(null);
    }
  };

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  // Filter data
  const filteredData = useMemo(() => {
    return pelangganData.filter((pelanggan) => {
      const matchesSearch = 
        pelanggan.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pelanggan.alamat.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pelanggan.id.includes(searchTerm);
      
      const matchesStatus = statusFilter === "Semua" || pelanggan.statusPembayaran === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [pelangganData, searchTerm, statusFilter]);

  // Calculate statistics
  const totalPelanggan = pelangganData.length;
  const pelangganLunas = pelangganData.filter((p) => p.statusPembayaran === "Lunas").length;
  const pelangganBelumBayar = pelangganData.filter((p) => p.statusPembayaran === "Belum Bayar").length;
  const pelangganTidakAdaTagihan = pelangganData.filter((p) => p.statusPembayaran === "Tidak Ada Tagihan").length;

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

  // Reset form ketika dialog ditutup
  const handleDialogOpenChange = (open: boolean) => {
    if (!open) {
      setShowBuatTagihanForm(false);
      setNominalTagihan("");
      setSelectedPelanggan(null);
    }
  };

  // Handle refresh data
  const handleRefresh = () => {
    fetchPelangganData(false);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Memuat data pelanggan...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header dengan Refresh Button */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Manajemen Pelanggan</h1>
            <p className="text-muted-foreground">
              Kelola data pelanggan dan tagihan dengan mudah
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              🕐 WIB (UTC+7)
            </Badge>
            <Button
              onClick={handleRefresh}
              disabled={refreshing}
              variant="outline"
              size="sm"
            >
              {refreshing ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Refresh
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-full bg-blue-500/10">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Pelanggan</p>
                  <p className="text-2xl font-bold">{totalPelanggan}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-full bg-green-500/10">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Lunas</p>
                  <p className="text-2xl font-bold">{pelangganLunas}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-full bg-orange-500/10">
                  <AlertCircle className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Belum Bayar</p>
                  <p className="text-2xl font-bold">{pelangganBelumBayar}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-full bg-gray-500/10">
                  <XCircle className="h-6 w-6 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tidak Ada Tagihan</p>
                  <p className="text-2xl font-bold">{pelangganTidakAdaTagihan}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Table Card */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <CardTitle>Daftar Pelanggan</CardTitle>
              <div className="text-sm text-muted-foreground">
                Menampilkan {currentData.length} dari {filteredData.length} pelanggan
              </div>
            </div>
            
            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari nama, alamat, atau ID pelanggan..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-10"
                />
              </div>
              
              <Select
                value={statusFilter}
                onValueChange={(value: "Semua" | "Lunas" | "Belum Bayar" | "Tidak Ada Tagihan") => {
                  setStatusFilter(value);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Semua">Semua Status</SelectItem>
                  <SelectItem value="Lunas">Lunas</SelectItem>
                  <SelectItem value="Belum Bayar">Belum Bayar</SelectItem>
                  <SelectItem value="Tidak Ada Tagihan">Tidak Ada Tagihan</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          
          <CardContent>
            {currentData.length > 0 ? (
              <>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[80px]">ID</TableHead>
                        <TableHead>Nama Pelanggan</TableHead>
                        <TableHead className="hidden md:table-cell">Alamat</TableHead>
                        <TableHead className="w-[140px]">Status</TableHead>
                        <TableHead className="w-[120px] text-right">Tagihan</TableHead>
                        <TableHead className="w-[100px] text-right">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentData.map((pelanggan) => (
                        <TableRow key={pelanggan.id} className="hover:bg-muted/50">
                          <TableCell className="font-medium">#{pelanggan.id}</TableCell>
                          <TableCell>
                            <div className="font-medium">{pelanggan.nama}</div>
                            <div className="text-sm text-muted-foreground md:hidden flex items-center mt-1">
                              <Phone className="h-3 w-3 mr-1" />
                              {pelanggan.telepon}
                            </div>
                            <div className="text-sm text-muted-foreground md:hidden mt-1">
                              {pelanggan.alamat.length > 40 
                                ? pelanggan.alamat.substring(0, 40) + "..." 
                                : pelanggan.alamat}
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <div className="max-w-[200px] truncate" title={pelanggan.alamat}>
                              {pelanggan.alamat}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                pelanggan.statusPembayaran === "Lunas" ? "default" :
                                pelanggan.statusPembayaran === "Belum Bayar" ? "destructive" : "secondary"
                              }
                              className="whitespace-nowrap"
                            >
                              {pelanggan.statusPembayaran === "Lunas" ? (
                                <CheckCircle className="h-3 w-3 mr-1" />
                              ) : pelanggan.statusPembayaran === "Belum Bayar" ? (
                                <AlertCircle className="h-3 w-3 mr-1" />
                              ) : (
                                <XCircle className="h-3 w-3 mr-1" />
                              )}
                              {pelanggan.statusPembayaran}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {pelanggan.tagihan}
                          </TableCell>
                          <TableCell className="text-right">
                            <Dialog onOpenChange={handleDialogOpenChange}>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setSelectedPelanggan(pelanggan)}
                                >
                                  <Eye className="h-4 w-4" />
                                  <span className="sr-only">Detail</span>
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle>Detail Pelanggan</DialogTitle>
                                </DialogHeader>
                                {selectedPelanggan && (
                                  <div className="space-y-6">
                                    {/* Header with Status */}
                                    <div className="flex items-start justify-between">
                                      <div>
                                        <p className="text-sm text-muted-foreground">ID Pelanggan</p>
                                        <p className="text-lg font-bold">#{selectedPelanggan.id}</p>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Badge variant="outline" className="text-xs">
                                          🕐 WIB
                                        </Badge>
                                        <Badge
                                          variant={
                                            selectedPelanggan.statusPembayaran === "Lunas" ? "default" :
                                            selectedPelanggan.statusPembayaran === "Belum Bayar" ? "destructive" : "secondary"
                                          }
                                          className="text-xs"
                                        >
                                          {selectedPelanggan.statusPembayaran}
                                        </Badge>
                                      </div>
                                    </div>

                                    {/* Name */}
                                    <div>
                                      <p className="text-sm text-muted-foreground mb-1">Nama Lengkap</p>
                                      <p className="font-semibold text-lg">{selectedPelanggan.nama}</p>
                                    </div>

                                    {/* Contact Info */}
                                    <div className="space-y-3">
                                      {/* Address */}
                                      <div className="flex items-start space-x-3">
                                        <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                                        <div className="flex-1">
                                          <p className="text-sm text-muted-foreground">Alamat</p>
                                          <p className="font-medium">{selectedPelanggan.alamat}</p>
                                        </div>
                                      </div>

                                      <div className="flex items-center space-x-3">
                                        <Phone className="h-4 w-4 text-muted-foreground" />
                                        <div className="flex-1">
                                          <p className="text-sm text-muted-foreground">Telepon</p>
                                          <p className="font-medium">{selectedPelanggan.telepon}</p>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Section Buat Tagihan Baru - TAMPIL SELALU */}
                                    <div className="pt-4 border-t">
                                      <div className="flex items-center justify-between mb-4">
                                        <div>
                                          <p className="text-sm font-medium text-muted-foreground">Kelola Tagihan</p>
                                          <p className="text-xs text-muted-foreground">
                                            Buat tagihan baru untuk pelanggan ini
                                          </p>
                                        </div>
                                        <Button
                                          size="sm"
                                          onClick={() => setShowBuatTagihanForm(!showBuatTagihanForm)}
                                          variant={showBuatTagihanForm ? "outline" : "default"}
                                        >
                                          <Plus className="h-4 w-4 mr-2" />
                                          {showBuatTagihanForm ? "Tutup Form" : "Buat Tagihan Baru"}
                                        </Button>
                                      </div>

                                      {/* Form Buat Tagihan Baru - TAMPIL KETIKA TOMBOL DITEKAN */}
                                      {showBuatTagihanForm && (
                                        <div className="space-y-4 p-4 border rounded-lg bg-blue-50/50 dark:bg-blue-950/20">
                                          <div className="flex items-center space-x-2">
                                            <Plus className="h-5 w-5 text-blue-600" />
                                            <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
                                              Form Tagihan Baru
                                            </p>
                                          </div>
                                          
                                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                              <label className="text-sm font-medium mb-2 block">
                                                Periode Tagihan <span className="text-red-500">*</span>
                                              </label>
                                              <Select
                                                value={selectedPeriode}
                                                onValueChange={(value: "minggu" | "bulan" | "tahun") => setSelectedPeriode(value)}
                                              >
                                                <SelectTrigger>
                                                  <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                  <SelectItem value="minggu">💫 Mingguan</SelectItem>
                                                  <SelectItem value="bulan">📅 Bulanan</SelectItem>
                                                  <SelectItem value="tahun">🎯 Tahunan</SelectItem>
                                                </SelectContent>
                                              </Select>
                                              <p className="text-xs text-muted-foreground mt-1">
                                                Pilih periode penagihan
                                              </p>
                                            </div>
                                            
                                            <div>
                                              <label className="text-sm font-medium mb-2 block">
                                                Nominal Tagihan <span className="text-red-500">*</span>
                                              </label>
                                              <Input
                                                type="text"
                                                value={nominalTagihan ? formatRupiah(nominalTagihan) : ""}
                                                onChange={handleNominalChange}
                                                placeholder="Contoh: 50000"
                                                className="text-right font-medium"
                                              />
                                              <p className="text-xs text-muted-foreground mt-1">
                                                Masukkan jumlah tagihan
                                              </p>
                                            </div>
                                          </div>

                                          {/* Preview Tagihan */}
                                          {nominalTagihan && (
                                            <div className="p-3 border rounded-lg bg-white dark:bg-gray-800">
                                              <p className="text-sm font-medium mb-2">Preview Tagihan:</p>
                                              <div className="grid grid-cols-2 gap-2 text-sm">
                                                <div>
                                                  <p className="text-muted-foreground">Periode:</p>
                                                  <p className="font-medium capitalize">{selectedPeriode}an</p>
                                                </div>
                                                <div>
                                                  <p className="text-muted-foreground">Nominal:</p>
                                                  <p className="font-medium text-green-600">
                                                    {formatRupiah(nominalTagihan)}
                                                  </p>
                                                </div>
                                              </div>
                                            </div>
                                          )}

                                          <div className="flex gap-2 justify-end pt-2">
                                            <Button
                                              variant="outline"
                                              size="sm"
                                              onClick={() => {
                                                setShowBuatTagihanForm(false);
                                                setNominalTagihan("");
                                              }}
                                            >
                                              ✕ Batal
                                            </Button>
                                            <Button
                                              size="sm"
                                              onClick={() => buatTagihan(parseInt(selectedPelanggan.id), Number(nominalTagihan))}
                                              disabled={
                                                generatingTagihan === parseInt(selectedPelanggan.id) || 
                                                !nominalTagihan || 
                                                Number(nominalTagihan) === 0
                                              }
                                              className="bg-blue-600 hover:bg-blue-700"
                                            >
                                              {generatingTagihan === parseInt(selectedPelanggan.id) ? (
                                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                              ) : (
                                                <Plus className="h-4 w-4 mr-2" />
                                              )}
                                              Buat Tagihan
                                            </Button>
                                          </div>

                                          {/* Informasi tambahan */}
                                          <div className="text-xs text-muted-foreground border-t pt-2">
                                            <p>💡 Tagihan baru akan langsung aktif dan tercatat dalam sistem</p>
                                            <p>💡 Pelanggan dapat melihat tagihan ini di aplikasi mereka</p>
                                          </div>
                                        </div>
                                      )}

                                      {/* Daftar Tagihan Aktif */}
                                      <div className="mt-4">
                                        <div className="flex items-center justify-between mb-3">
                                          <p className="text-sm font-medium text-muted-foreground">
                                            Tagihan Aktif ({selectedPelanggan.tagihan_list.filter(t => !t.status_bayar).length})
                                          </p>
                                          <Badge variant="outline" className="text-xs">
                                            🕐 Waktu WIB
                                          </Badge>
                                        </div>
                                        
                                        {selectedPelanggan.tagihan_list && selectedPelanggan.tagihan_list.length > 0 ? (
                                          <div className="space-y-3">
                                            {selectedPelanggan.tagihan_list.map((tagihan) => (
                                              <div key={tagihan.id_tagihan} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
                                                <div className="flex-1">
                                                  <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center space-x-2">
                                                      <p className="font-medium capitalize">
                                                        {tagihan.periode_tagihan}an - {formatTanggalSederhana(tagihan.created_at)}
                                                      </p>
                                                      {!tagihan.status_bayar && isTanggalTerlambat(tagihan.expired_at) && (
                                                        <Badge variant="destructive" className="text-xs">
                                                          Terlambat
                                                        </Badge>
                                                      )}
                                                    </div>
                                                    <Badge
                                                      variant={tagihan.status_bayar ? "default" : "destructive"}
                                                    >
                                                      {tagihan.status_bayar ? (
                                                        <CheckCircle className="h-3 w-3 mr-1" />
                                                      ) : (
                                                        <AlertCircle className="h-3 w-3 mr-1" />
                                                      )}
                                                      {tagihan.status_bayar ? "Lunas" : "Belum Bayar"}
                                                    </Badge>
                                                  </div>
                                                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                                                    <div>
                                                      <p className="text-muted-foreground">Total Tagihan</p>
                                                      <p className="font-semibold text-green-600">
                                                        Rp {tagihan.total_tagihan.toLocaleString('id-ID')}
                                                      </p>
                                                    </div>
                                                    <div>
                                                      <p className="text-muted-foreground">Batas Waktu</p>
                                                      <p className={`font-medium ${
                                                        !tagihan.status_bayar && isTanggalTerlambat(tagihan.expired_at) 
                                                          ? 'text-red-600' 
                                                          : 'text-foreground'
                                                      }`}>
                                                        {formatTanggalWIB(tagihan.expired_at)}
                                                      </p>
                                                    </div>
                                                    <div className="hidden md:block">
                                                      <p className="text-muted-foreground">Dibuat</p>
                                                      <p className="font-medium">{formatTanggalWIB(tagihan.created_at)}</p>
                                                    </div>
                                                  </div>
                                                </div>
                                                <div className="ml-4">
                                                  {!tagihan.status_bayar && (
                                                    <Button
                                                      size="sm"
                                                      onClick={() => prosesPembayaran(tagihan.id_tagihan)}
                                                      disabled={processingPembayaran === tagihan.id_tagihan}
                                                    >
                                                      {processingPembayaran === tagihan.id_tagihan ? (
                                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                                      ) : (
                                                        <CreditCard className="h-4 w-4 mr-2" />
                                                      )}
                                                      Bayar
                                                    </Button>
                                                  )}
                                                </div>
                                              </div>
                                            ))}
                                          </div>
                                        ) : (
                                          <div className="text-center py-8 border rounded-lg bg-muted/20">
                                            <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                                            <p className="text-sm text-muted-foreground">
                                              Belum ada tagihan untuk pelanggan ini
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-1">
                                              Klik "Buat Tagihan Baru" untuk menambahkan tagihan pertama
                                            </p>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-6 flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      Menampilkan {startIndex + 1}-{Math.min(endIndex, filteredData.length)} dari {filteredData.length} pelanggan
                    </div>
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                            className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                          />
                        </PaginationItem>
                        
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let pageNum;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }
                          
                          return (
                            <PaginationItem key={pageNum}>
                              <PaginationLink
                                onClick={() => setCurrentPage(pageNum)}
                                isActive={currentPage === pageNum}
                                className="cursor-pointer"
                              >
                                {pageNum}
                              </PaginationLink>
                            </PaginationItem>
                          );
                        })}
                        
                        <PaginationItem>
                          <PaginationNext
                            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                            className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium">Tidak ada data ditemukan</p>
                <p className="text-sm text-muted-foreground mt-2">
                  {searchTerm || statusFilter !== "Semua" 
                    ? "Coba ubah filter atau kata kunci pencarian" 
                    : "Belum ada data pelanggan yang terdaftar"}
                </p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={handleRefresh}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Data
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default Pelanggan;