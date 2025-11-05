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
import { Eye, Search, Users, CheckCircle, XCircle, Phone, MapPin } from "lucide-react";

// Tipe data sesuai response API
interface Alamat {
  lokasi_alamat: string;
  latitude: number;
  longitude: number;
  nama_alamatmode: string;
}

interface UserDetail {
  id_user: number;
  nama: string;
  no_telepon: string;
  nama_alamatmode: string[];
  alamat: Alamat[];
}

interface TagihanUser {
  id_user: number;
  tagihan?: string;
  statusPembayaran?: "Lunas" | "Belum Bayar";
}

interface TpaTagihanResponse {
  tpa_id: number;
  nama_tpa: string;
  total_user: number;
  users: TagihanUser[];
}

interface Pelanggan {
  id: string;
  nama: string;
  alamat: string;
  statusPembayaran: "Lunas" | "Belum Bayar";
  telepon: string;
  tagihan: string;
  originalData: UserDetail & TagihanUser;
}

// Fungsi untuk mendapatkan cookie by name
const getCookie = (name: string): string | null => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
};

const Pelanggan = () => {
  const [pelangganData, setPelangganData] = useState<Pelanggan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPelanggan, setSelectedPelanggan] = useState<(UserDetail & TagihanUser) | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"Semua" | "Lunas" | "Belum Bayar">("Semua");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Fetch data pelanggan
  useEffect(() => {
    const fetchPelangganData = async () => {
      try {
        setLoading(true);
        
        // Ambil data dari cookies
        const userInfoCookie = getCookie("user_info");
        const token = getCookie("access_token");
        const uid = getCookie("user_id");

        if (!token) {
          console.warn("⚠️ Token access_token tidak ditemukan di cookies");
          throw new Error("Token akses tidak ditemukan. Silakan login kembali.");
        }

        let tpaId = 1; // default fallback

        if (userInfoCookie) {
          try {
            const userInfo = JSON.parse(userInfoCookie);
            tpaId = userInfo?.tpa_list?.[0]?.id_tpa || 1;
            console.log("✅ Menggunakan id_tpa dari user_info:", tpaId);
          } catch (err) {
            console.error("Gagal parsing cookie user_info:", err);
            console.warn("⚠️ Fallback ke id_tpa=1");
            tpaId = 1;
          }
        } else {
          console.warn("⚠️ Cookie user_info tidak ditemukan, fallback ke id_tpa=1");
          tpaId = 1;
        }

        // Fetch semua user dengan tagihan dari TPA
        const tagihanResponse = await fetch(`http://localhost:8000/tpa/tagihan/${tpaId}/all-users`, {
          headers: { 
            accept: 'application/json',
            Authorization: `Bearer ${token}` // tambahkan token jika diperlukan
          }
        });

        if (!tagihanResponse.ok) {
          throw new Error('Gagal fetch data tagihan');
        }

        const tagihanData: TpaTagihanResponse = await tagihanResponse.json();
        
        // Ambil array users dari response
        const tagihanUsers: TagihanUser[] = tagihanData.users || [];
        
        console.log("📊 Jumlah user dengan tagihan:", tagihanUsers.length);
        console.log("📋 Data TPA:", {
          nama_tpa: tagihanData.nama_tpa,
          total_user: tagihanData.total_user,
          tpa_id: tagihanData.tpa_id
        });

        // Jika tidak ada data, set empty array dan selesai
        if (tagihanUsers.length === 0) {
          setPelangganData([]);
          setLoading(false);
          return;
        }

        // Fetch detail untuk setiap user
        const pelangganDetails = await Promise.all(
          tagihanUsers.map(async (user: TagihanUser) => {
            try {
              const userDetailResponse = await fetch(`http://localhost:8000/users/get-user-detail/${user.id_user}`, {
                headers: { 
                  accept: 'application/json',
                  Authorization: `Bearer ${token}` // tambahkan token jika diperlukan
                }
              });
              
              if (!userDetailResponse.ok) {
                throw new Error(`Gagal fetch detail user ${user.id_user}`);
              }
              
              const userDetail: UserDetail = await userDetailResponse.json();
              
              return {
                id: user.id_user.toString(),
                nama: userDetail.nama,
                alamat: userDetail.alamat.length > 0 ? userDetail.alamat[0].lokasi_alamat : "Tidak ada alamat",
                statusPembayaran: user.statusPembayaran || "Belum Bayar",
                telepon: userDetail.no_telepon,
                tagihan: user.tagihan || "Rp 0",
                originalData: {
                  ...userDetail,
                  ...user
                }
              } as Pelanggan;
            } catch (error) {
              console.error(`Error fetching detail user ${user.id_user}:`, error);
              return null;
            }
          })
        );

        // Filter out null values and set data
        const validPelanggan = pelangganDetails.filter(Boolean) as Pelanggan[];
        console.log("✅ Data pelanggan berhasil di-load:", validPelanggan.length, "pelanggan");
        setPelangganData(validPelanggan);
        setLoading(false);
      } catch (error) {
        console.error('❌ Gagal fetch data pelanggan:', error);
        setPelangganData([]);
        setLoading(false);
      }
    };

    fetchPelangganData();
  }, []);

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

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

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
        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-full bg-primary/10">
                  <Users className="h-6 w-6 text-primary" />
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
                <div className="p-3 rounded-full bg-destructive/10">
                  <XCircle className="h-6 w-6 text-destructive" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Belum Bayar</p>
                  <p className="text-2xl font-bold">{pelangganBelumBayar}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Table Card */}
        <Card>
          <CardHeader>
            <CardTitle>Data Pelanggan</CardTitle>
            
            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari nama, alamat, atau ID..."
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
                onValueChange={(value: "Semua" | "Lunas" | "Belum Bayar") => {
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
                        <TableHead>ID</TableHead>
                        <TableHead>Nama</TableHead>
                        <TableHead className="hidden md:table-cell">Alamat</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentData.map((pelanggan) => (
                        <TableRow key={pelanggan.id}>
                          <TableCell className="font-medium">{pelanggan.id}</TableCell>
                          <TableCell>
                            <div className="font-medium">{pelanggan.nama}</div>
                            <div className="text-sm text-muted-foreground md:hidden">
                              {pelanggan.alamat.length > 30 
                                ? pelanggan.alamat.substring(0, 30) + "..." 
                                : pelanggan.alamat}
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">{pelanggan.alamat}</TableCell>
                          <TableCell>
                            <Badge
                              variant={pelanggan.statusPembayaran === "Lunas" ? "default" : "destructive"}
                              className="whitespace-nowrap"
                            >
                              {pelanggan.statusPembayaran === "Lunas" ? (
                                <CheckCircle className="h-3 w-3 mr-1" />
                              ) : (
                                <XCircle className="h-3 w-3 mr-1" />
                              )}
                              {pelanggan.statusPembayaran}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setSelectedPelanggan(pelanggan.originalData)}
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  <span className="hidden sm:inline">Detail</span>
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-md">
                                <DialogHeader>
                                  <DialogTitle>Detail Pelanggan</DialogTitle>
                                </DialogHeader>
                                {selectedPelanggan && (
                                  <div className="space-y-6">
                                    {/* Header with Status */}
                                    <div className="flex items-start justify-between">
                                      <div>
                                        <p className="text-sm text-muted-foreground">ID Pelanggan</p>
                                        <p className="text-lg font-bold">{selectedPelanggan.id_user}</p>
                                      </div>
                                      <Badge
                                        variant={selectedPelanggan.statusPembayaran === "Lunas" ? "default" : "destructive"}
                                        className="text-xs"
                                      >
                                        {selectedPelanggan.statusPembayaran === "Lunas" ? (
                                          <CheckCircle className="h-3 w-3 mr-1" />
                                        ) : (
                                          <XCircle className="h-3 w-3 mr-1" />
                                        )}
                                        {selectedPelanggan.statusPembayaran || "Belum Bayar"}
                                      </Badge>
                                    </div>

                                    {/* Name */}
                                    <div>
                                      <p className="text-sm text-muted-foreground mb-1">Nama Lengkap</p>
                                      <p className="font-semibold text-lg">{selectedPelanggan.nama}</p>
                                    </div>

                                    {/* Contact Info */}
                                    <div className="space-y-3">
                                      {/* Addresses */}
                                      {selectedPelanggan.alamat && selectedPelanggan.alamat.length > 0 ? (
                                        selectedPelanggan.alamat.map((alamat, index) => (
                                          <div key={index} className="flex items-start space-x-3">
                                            <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                                            <div className="flex-1">
                                              <p className="text-sm text-muted-foreground">
                                                Alamat {selectedPelanggan.alamat.length > 1 ? index + 1 : ''}
                                              </p>
                                              <p className="font-medium">{alamat.lokasi_alamat}</p>
                                              {alamat.nama_alamatmode && (
                                                <p className="text-xs text-muted-foreground mt-1">
                                                  Tipe: {alamat.nama_alamatmode}
                                                </p>
                                              )}
                                            </div>
                                          </div>
                                        ))
                                      ) : (
                                        <div className="flex items-start space-x-3">
                                          <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                                          <div className="flex-1">
                                            <p className="text-sm text-muted-foreground">Alamat</p>
                                            <p className="font-medium text-muted-foreground">Tidak ada alamat</p>
                                          </div>
                                        </div>
                                      )}

                                      <div className="flex items-center space-x-3">
                                        <Phone className="h-4 w-4 text-muted-foreground" />
                                        <div className="flex-1">
                                          <p className="text-sm text-muted-foreground">Telepon</p>
                                          <p className="font-medium">{selectedPelanggan.no_telepon}</p>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Billing */}
                                    <div className="pt-4 border-t">
                                      <div className="flex items-center justify-between">
                                        <p className="text-sm text-muted-foreground">Total Tagihan</p>
                                        <p className="text-xl font-bold text-primary">
                                          {selectedPelanggan.tagihan || "Rp 0"}
                                        </p>
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
                  <div className="mt-4">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
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
                <p className="text-sm text-muted-foreground">
                  {searchTerm || statusFilter !== "Semua" 
                    ? "Coba ubah filter atau kata kunci pencarian" 
                    : "Belum ada data pelanggan"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default Pelanggan;