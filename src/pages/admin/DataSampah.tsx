import { useState, useEffect } from "react";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Plus, 
  Trash2, 
  Search, 
  Package, 
  TrendingUp, 
  Calendar,
  Loader2,
  AlertTriangle,
  Filter,
  CalendarDays,
  Download,
  RefreshCw
} from "lucide-react";
import { toast } from "sonner";
const apiUrl = import.meta.env.VITE_API_URL;

interface DataSampah {
  id_sampahtpa: number;
  id_tpa: number;
  nama_tpa: string;
  id_kategorisampah: number;
  nama_kategorisampah: string;
  berat_sampah: number;
  tanggal: string;
}

interface TPA {
  id_tpa: number;
  nama_tpa: string;
  alamat_tpa: string;
  status_tpa: string;
  assigned_at: string;
}

interface UserTPAData {
  user_id: number;
  nama_user: string;
  tpa_list: TPA[];
}

interface KategoriSampah {
  id_kategorisampah: number;
  nama_kategorisampah: string;
}

interface DeleteSampahRequest {
  id_sampahtpa?: number;
  id_tpa?: number;
  id_kategorisampah?: number;
  tanggal?: string;
  start_date?: string;
  end_date?: string;
  delete_all?: boolean;
}

interface AllSampahResponse {
  total_data: number;
  total_berat_kg: number;
  data_sampah: DataSampah[];
}

const DataSampah = () => {
  const [data, setData] = useState<DataSampah[]>([]);
  const [currentTpa, setCurrentTpa] = useState<TPA | null>(null);
  const [open, setOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [kategoriList, setKategoriList] = useState<KategoriSampah[]>([]);
  const [selectedItem, setSelectedItem] = useState<DataSampah | null>(null);
  const [totalStats, setTotalStats] = useState({ totalData: 0, totalBerat: 0 });
  
  const [formData, setFormData] = useState({
    kategori: "",
    berat: "",
    tanggal: new Date().toISOString().split('T')[0],
    lokasi: "",
  });

  const [bulkDeleteData, setBulkDeleteData] = useState({
    kategori: "",
    start_date: "",
    end_date: "",
    delete_all: false,
  });

  // Get user_id from cookies
  const getUserIdFromCookies = (): number | null => {
    if (typeof document === 'undefined') return null;
    
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'user_id') {
        return parseInt(value, 10);
      }
    }
    return null;
  };

  // Fetch kategori sampah
  const fetchKategoriSampah = async () => {
    try {
      const response = await fetch(`http://${import.meta.env.VITE_API_URL}/sampah/kategori-sampah`, {
        method: 'GET',
        headers: {
          'accept': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setKategoriList(data.kategori_sampah);
      } else {
        throw new Error('Gagal mengambil data kategori');
      }
    } catch (error) {
      console.error('Error fetching kategori:', error);
      toast.error("Gagal mengambil data kategori sampah");
    }
  };

  // Fetch all sampah data dengan endpoint analytics yang benar
  const fetchAllSampahData = async (showLoading: boolean = true) => {
    if (!currentTpa) return;

    try {
      if (showLoading) setLoading(true);
      
      // Gunakan endpoint analytics/all-sampah dengan filter TPA
      const response = await fetch(`http://${import.meta.env.VITE_API_URL}/analytics/all-sampah?id_tpa=${currentTpa.id_tpa}`, {
        method: 'GET',
        headers: {
          'accept': 'application/json',
        },
      });

      if (response.ok) {
        const result: AllSampahResponse = await response.json();
        setData(result.data_sampah);
        setTotalStats({
          totalData: result.total_data,
          totalBerat: result.total_berat_kg
        });
      } else {
        throw new Error('Gagal mengambil data sampah');
      }
    } catch (error) {
      console.error('Error fetching sampah data:', error);
      toast.error("Gagal mengambil data sampah");
    } finally {
      if (showLoading) setLoading(false);
      setRefreshing(false);
    }
  };

  // Fetch TPA data and initialize
  const fetchData = async () => {
    try {
      setLoading(true);
      const userId = getUserIdFromCookies();
      if (!userId) {
        toast.error("User ID tidak ditemukan dalam cookies");
        setLoading(false);
        return;
      }

      // Fetch TPA data
      const tpaResponse = await fetch(`http://${import.meta.env.VITE_API_URL}/tpa/user/${userId}/tpa`, {
        method: 'GET',
        headers: {
          'accept': 'application/json',
        },
      });

      if (!tpaResponse.ok) {
        throw new Error('Gagal mengambil data TPA');
      }

      const tpaData: UserTPAData = await tpaResponse.json();
      
      if (tpaData.tpa_list.length === 0) {
        toast.error("Tidak ada TPA yang ditugaskan untuk user ini");
        setLoading(false);
        return;
      }

      // Use the first TPA
      const firstTpa = tpaData.tpa_list[0];
      setCurrentTpa(firstTpa);

    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error("Gagal mengambil data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    fetchKategoriSampah();
  }, []);

  useEffect(() => {
    if (currentTpa) {
      fetchAllSampahData();
    }
  }, [currentTpa]);

  // Submit data sampah ke backend
  const submitDataSampah = async () => {
    try {
      setSubmitting(true);

      // Cari ID kategori
      const kategori = kategoriList.find(
        k => k.nama_kategorisampah === formData.kategori
      );

      if (!kategori) {
        toast.error("Kategori tidak valid");
        setSubmitting(false);
        return;
      }

      if (!currentTpa) {
        toast.error("TPA tidak ditemukan");
        setSubmitting(false);
        return;
      }

      const payload = {
        id_tpa: currentTpa.id_tpa,
        id_kategorisampah: kategori.id_kategorisampah,
        berat_sampah: parseFloat(formData.berat),
        tanggal: formData.tanggal
      };

      const response = await fetch(`http://${import.meta.env.VITE_API_URL}/sampah/tpa`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'accept': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const result = await response.json();
        toast.success(result.message);
        
        // Reset form
        setFormData({
          kategori: "",
          berat: "",
          tanggal: new Date().toISOString().split('T')[0],
          lokasi: "",
        });
        setOpen(false);
        
        // Refresh data
        fetchAllSampahData(false);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Gagal menambah data sampah');
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle delete single item
  const handleDelete = async (item: DataSampah) => {
    setSelectedItem(item);
    setDeleteDialogOpen(true);
  };

  // Confirm delete single item
  const confirmDelete = async () => {
    if (!selectedItem) return;

    try {
      setDeleting(true);
      
      const response = await fetch(`http://${import.meta.env.VITE_API_URL}/sampah/tpa/${selectedItem.id_sampahtpa}`, {
        method: 'DELETE',
        headers: {
          'accept': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        toast.success(result.message);
        setDeleteDialogOpen(false);
        setSelectedItem(null);
        
        // Refresh data
        fetchAllSampahData(false);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Gagal menghapus data');
      }
    } catch (error: any) {
      toast.error(error.message || "Gagal menghapus data");
    } finally {
      setDeleting(false);
    }
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (!currentTpa) {
      toast.error("TPA tidak ditemukan");
      return;
    }

    try {
      setDeleting(true);

      const deletePayload: DeleteSampahRequest = {
        id_tpa: currentTpa.id_tpa
      };

      // Add category filter if selected
      if (bulkDeleteData.kategori && !bulkDeleteData.delete_all) {
        const kategori = kategoriList.find(k => k.nama_kategorisampah === bulkDeleteData.kategori);
        if (kategori) {
          deletePayload.id_kategorisampah = kategori.id_kategorisampah;
        }
      }

      // Add date range filters
      if (bulkDeleteData.start_date && !bulkDeleteData.delete_all) {
        deletePayload.start_date = bulkDeleteData.start_date;
      }

      if (bulkDeleteData.end_date && !bulkDeleteData.delete_all) {
        deletePayload.end_date = bulkDeleteData.end_date;
      }

      // Add delete_all flag
      if (bulkDeleteData.delete_all) {
        deletePayload.delete_all = true;
      }

      const response = await fetch(`http://${import.meta.env.VITE_API_URL}/sampah/tpa`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'accept': 'application/json',
        },
        body: JSON.stringify(deletePayload),
      });

      if (response.ok) {
        const result = await response.json();
        toast.success(result.message);
        setBulkDeleteDialogOpen(false);
        setBulkDeleteData({
          kategori: "",
          start_date: "",
          end_date: "",
          delete_all: false,
        });
        
        // Refresh data
        fetchAllSampahData(false);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Gagal menghapus data');
      }
    } catch (error: any) {
      toast.error(error.message || "Gagal menghapus data");
    } finally {
      setDeleting(false);
    }
  };

  // Handle refresh data
  const handleRefresh = () => {
    setRefreshing(true);
    fetchAllSampahData(false);
  };

  // Handle export data
  const handleExport = () => {
    try {
      const csvData = [
        ['ID', 'TPA', 'Kategori', 'Berat (kg)', 'Tanggal'],
        ...data.map(item => [
          item.id_sampahtpa.toString(),
          item.nama_tpa,
          item.nama_kategorisampah,
          item.berat_sampah.toString(),
          new Date(item.tanggal).toLocaleDateString('id-ID')
        ])
      ];

      const csvContent = csvData.map(row => row.join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `data-sampah-${currentTpa?.nama_tpa}-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success("Data berhasil diexport");
    } catch (error) {
      toast.error("Gagal mengexport data");
    }
  };

  // Handle submit form utama
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validasi dasar
    if (!formData.kategori || !formData.berat || !formData.tanggal) {
      toast.error("Harap isi semua field yang wajib");
      return;
    }

    // Validasi berat
    const berat = parseFloat(formData.berat);
    if (isNaN(berat) || berat <= 0) {
      toast.error("Berat harus berupa angka positif");
      return;
    }

    await submitDataSampah();
  };

  const totalBerat = data.reduce((sum, item) => sum + item.berat_sampah, 0);
  const totalEntries = data.length;
  
  const filteredData = data.filter(item =>
    item.nama_kategorisampah.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.nama_tpa.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.tanggal.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCategoryColor = (kategori: string) => {
    const colors: Record<string, string> = {
      "Organik": "bg-green-100 text-green-800",
      "Anorganik": "bg-amber-100 text-amber-800",
      "Plastik": "bg-blue-100 text-blue-800",
      "Kertas": "bg-amber-100 text-amber-800",
      "Logam": "bg-gray-100 text-gray-800",
      "Kaca": "bg-cyan-100 text-cyan-800",
      "Sisa Makanan": "bg-orange-100 text-orange-800",
      "Daun-daunan": "bg-lime-100 text-lime-800",
      "Elektronik": "bg-red-100 text-red-800",
    };
    return colors[kategori] || "bg-gray-100 text-gray-800";
  };

  // Calculate most frequent category
  const getMostFrequentCategory = () => {
    if (data.length === 0) return { category: "N/A", count: 0 };

    const categoryCount = data.reduce((acc, item) => {
      acc[item.nama_kategorisampah] = (acc[item.nama_kategorisampah] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const mostFrequent = Object.keys(categoryCount).reduce((a, b) => 
      categoryCount[a] > categoryCount[b] ? a : b
    );

    return { category: mostFrequent, count: categoryCount[mostFrequent] };
  };

  const mostFrequentCategory = getMostFrequentCategory();

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <div className="text-lg">Memuat data...</div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* TPA Info Card */}
        {currentTpa && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col gap-2">
                <h3 className="text-lg font-semibold">{currentTpa.nama_tpa}</h3>
                <p className="text-sm text-muted-foreground">{currentTpa.alamat_tpa}</p>
                <Badge 
                  className={`w-fit ${
                    currentTpa.status_tpa === 'Aktif' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}
                  variant="outline"
                >
                  {currentTpa.status_tpa}
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Data Sampah
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalStats.totalData} Data</div>
              <p className="text-xs text-muted-foreground">
                {totalEntries} data ditampilkan
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Berat Sampah
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalStats.totalBerat.toFixed(1)} kg</div>
              <p className="text-xs text-muted-foreground">
                {totalBerat.toFixed(1)} kg ditampilkan
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Kategori Terbanyak
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {mostFrequentCategory.count}x
              </div>
              <div className="text-sm text-muted-foreground">
                {mostFrequentCategory.category}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Data Card */}
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <CardTitle>Data Sampah Terkumpul</CardTitle>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1 sm:w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Cari kategori, TPA, atau tanggal..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
                
                <Button
                  variant="outline"
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="gap-2"
                >
                  {refreshing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                  Refresh
                </Button>

                <Button
                  variant="outline"
                  onClick={handleExport}
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  Export
                </Button>
                
                <Dialog open={bulkDeleteDialogOpen} onOpenChange={setBulkDeleteDialogOpen}>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-amber-600" />
                        Hapus Data Massal
                      </DialogTitle>
                      <DialogDescription>
                        Hapus data sampah berdasarkan filter tertentu
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Filter Kategori</Label>
                        <Select
                          value={bulkDeleteData.kategori}
                          onValueChange={(value) => setBulkDeleteData({ ...bulkDeleteData, kategori: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Semua kategori" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">Semua Kategori</SelectItem>
                            {kategoriList.map((kategori) => (
                              <SelectItem 
                                key={kategori.id_kategorisampah} 
                                value={kategori.nama_kategorisampah}
                              >
                                {kategori.nama_kategorisampah}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Rentang Tanggal</Label>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <Label className="text-xs">Dari</Label>
                            <Input
                              type="date"
                              value={bulkDeleteData.start_date}
                              onChange={(e) => setBulkDeleteData({ ...bulkDeleteData, start_date: e.target.value })}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Sampai</Label>
                            <Input
                              type="date"
                              value={bulkDeleteData.end_date}
                              onChange={(e) => setBulkDeleteData({ ...bulkDeleteData, end_date: e.target.value })}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="delete-all"
                          checked={bulkDeleteData.delete_all}
                          onChange={(e) => setBulkDeleteData({ ...bulkDeleteData, delete_all: e.target.checked })}
                          className="rounded border-gray-300"
                        />
                        <Label htmlFor="delete-all" className="text-sm">
                          Hapus semua data (tanpa filter)
                        </Label>
                      </div>

                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5" />
                          <div className="text-sm text-amber-800">
                            <p className="font-medium">Peringatan!</p>
                            <p>Tindakan ini tidak dapat dibatalkan. Semua data yang sesuai filter akan dihapus permanen.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setBulkDeleteDialogOpen(false)}
                      >
                        Batal
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={handleBulkDelete}
                        disabled={deleting || (!bulkDeleteData.delete_all && !bulkDeleteData.kategori && !bulkDeleteData.start_date && !bulkDeleteData.end_date)}
                        className="gap-2"
                      >
                        {deleting ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                        Hapus Data
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Dialog open={open} onOpenChange={setOpen}>
                  <DialogTrigger asChild>
                    <Button className="gap-2">
                      <Plus className="h-4 w-4" />
                      Tambah Data
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Tambah Data Sampah Baru</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label>Kategori Sampah *</Label>
                        <Select
                          value={formData.kategori}
                          onValueChange={(value) => setFormData({ ...formData, kategori: value })}
                          required
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih kategori" />
                          </SelectTrigger>
                          <SelectContent>
                            {kategoriList.map((kategori) => (
                              <SelectItem 
                                key={kategori.id_kategorisampah} 
                                value={kategori.nama_kategorisampah}
                              >
                                {kategori.nama_kategorisampah}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                          Pilih kategori sampah dari daftar yang tersedia
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Berat (kg) *</Label>
                        <Input
                          type="number"
                          step="0.1"
                          min="0.1"
                          value={formData.berat}
                          onChange={(e) => setFormData({ ...formData, berat: e.target.value })}
                          placeholder="Masukkan berat dalam kg"
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Tanggal Pengumpulan *</Label>
                        <Input
                          type="date"
                          value={formData.tanggal}
                          onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Lokasi Pengumpulan</Label>
                        <Input
                          value={formData.lokasi}
                          onChange={(e) => setFormData({ ...formData, lokasi: e.target.value })}
                          placeholder="Contoh: Wilayah A RT 01"
                        />
                      </div>
                      
                      <Button 
                        type="submit" 
                        className="w-full gap-2"
                        disabled={submitting}
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Menyimpan...
                          </>
                        ) : (
                          'Simpan Data'
                        )}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">ID</TableHead>
                    <TableHead>TPA</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead className="text-right">Berat</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        {data.length === 0 ? "Belum ada data sampah" : "Tidak ada data yang sesuai dengan pencarian"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredData.map((item) => (
                      <TableRow key={item.id_sampahtpa}>
                        <TableCell className="font-mono font-medium">
                          #{item.id_sampahtpa.toString().padStart(3, '0')}
                        </TableCell>
                        <TableCell className="font-medium">
                          {item.nama_tpa}
                        </TableCell>
                        <TableCell>
                          <Badge className={getCategoryColor(item.nama_kategorisampah)} variant="outline">
                            {item.nama_kategorisampah}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {item.berat_sampah} kg
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <CalendarDays className="h-3 w-3 text-muted-foreground" />
                            {new Date(item.tanggal).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(item)}
                            className="hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Konfirmasi Hapus
            </DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus data sampah ini?
            </DialogDescription>
          </DialogHeader>
          
          {selectedItem && (
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">TPA:</span>
                <span className="text-sm font-medium">{selectedItem.nama_tpa}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Kategori:</span>
                <Badge variant="outline">{selectedItem.nama_kategorisampah}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Berat:</span>
                <span className="text-sm">{selectedItem.berat_sampah} kg</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Tanggal:</span>
                <span className="text-sm">
                  {new Date(selectedItem.tanggal).toLocaleDateString("id-ID")}
                </span>
              </div>
            </div>
          )}

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5" />
              <div className="text-sm text-amber-800">
                <p className="font-medium">Tindakan ini tidak dapat dibatalkan!</p>
                <p>Data yang dihapus tidak dapat dikembalikan.</p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleting}
              className="gap-2"
            >
              {deleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default DataSampah;