import { useState, useEffect } from "react";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Plus, Pencil, Trash2, Wallet, TrendingUp, Eye, Search, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

interface Anggaran {
  id: number;
  nama_anggaran: string;
  jumlah: number;
  created_at: string;
  updated_at: string;
}

interface AnggaranResponse {
  tpa_id: number;
  nama_tpa: string;
  total_items: number;
  anggaran_list: Anggaran[];
}

interface SummaryResponse {
  tpa_id: number;
  nama_tpa: string;
  summary: {
    total_anggaran: number;
    jumlah_item: number;
    rata_rata_anggaran: number;
  };
  recent_anggaran: Anggaran[];
}

const API_BASE_URL = `http://${import.meta.env.VITE_API_URL}`;

const formatRupiah = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
};

const Anggaran = () => {
  const [data, setData] = useState<Anggaran[]>([]);
  const [summary, setSummary] = useState<SummaryResponse | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Anggaran | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [tpaId] = useState(1); // Ganti dengan TPA ID yang sesuai
  const [formData, setFormData] = useState({
    nama_anggaran: "",
    jumlah: "",
  });

  // Fetch data anggaran
  const fetchAnggaran = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/tpa/${tpaId}/anggaran`);
      if (!response.ok) throw new Error("Gagal mengambil data anggaran");
      const result: AnggaranResponse = await response.json();
      setData(result.anggaran_list);
    } catch (error) {
      console.error("Error fetching anggaran:", error);
      toast.error("Gagal mengambil data anggaran");
    } finally {
      setLoading(false);
    }
  };

  // Fetch summary anggaran
  const fetchSummary = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/tpa/${tpaId}/anggaran/summary`);
      if (!response.ok) throw new Error("Gagal mengambil summary anggaran");
      const result: SummaryResponse = await response.json();
      setSummary(result);
    } catch (error) {
      console.error("Error fetching summary:", error);
    }
  };

  useEffect(() => {
    fetchAnggaran();
    fetchSummary();
  }, [tpaId]);

  const filteredData = data.filter(item =>
    item.nama_anggaran.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.created_at.includes(searchTerm)
  );

  const handleAdd = () => {
    setEditingItem(null);
    setFormData({ nama_anggaran: "", jumlah: "" });
    setIsDialogOpen(true);
  };

  const handleEdit = (item: Anggaran) => {
    setEditingItem(item);
    setFormData({
      nama_anggaran: item.nama_anggaran,
      jumlah: item.jumlah.toString(),
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus item anggaran ini?")) return;

    try {
      const response = await fetch(`${API_BASE_URL}/tpa/${tpaId}/anggaran/${id}`, {
        method: "DELETE",
        headers: {
          'accept': 'application/json',
        },
      });

      if (!response.ok) throw new Error("Gagal menghapus data");

      const result = await response.json();
      
      if (result.message === "Anggaran berhasil dihapus") {
        setData(data.filter(item => item.id !== id));
        fetchSummary(); // Refresh summary
        toast.success("Data berhasil dihapus");
      } else {
        throw new Error("Gagal menghapus data");
      }
    } catch (error) {
      console.error("Error deleting anggaran:", error);
      toast.error("Gagal menghapus data");
    }
  };

  const handleSubmit = async () => {
    if (!formData.nama_anggaran || !formData.jumlah) {
      toast.error("Semua field harus diisi");
      return;
    }

    const jumlah = Number(formData.jumlah);
    if (jumlah <= 0) {
      toast.error("Jumlah harus lebih dari 0");
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        nama_anggaran: formData.nama_anggaran,
        jumlah: jumlah,
      };

      let response: Response;

      if (editingItem) {
        // Update existing item
        response = await fetch(`${API_BASE_URL}/tpa/${tpaId}/anggaran/${editingItem.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            'accept': 'application/json',
          },
          body: JSON.stringify(payload),
        });
      } else {
        // Create new item
        response = await fetch(`${API_BASE_URL}/tpa/${tpaId}/anggaran`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            'accept': 'application/json',
          },
          body: JSON.stringify(payload),
        });
      }

      if (!response.ok) throw new Error(editingItem ? "Gagal mengupdate data" : "Gagal menambah data");

      const result = await response.json();
      
      if (editingItem) {
        setData(data.map(item => 
          item.id === editingItem.id ? result.anggaran : item
        ));
        toast.success("Data berhasil diupdate");
      } else {
        setData([...data, result.anggaran]);
        toast.success("Data berhasil ditambahkan");
      }

      fetchSummary(); // Refresh summary
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error submitting anggaran:", error);
      toast.error(editingItem ? "Gagal mengupdate data" : "Gagal menambah data");
    } finally {
      setSubmitting(false);
    }
  };

  // Prepare chart data
  const chartData = data.reduce((acc: any[], item) => {
    const existing = acc.find(chartItem => chartItem.name === item.nama_anggaran);
    if (existing) {
      existing.value += item.jumlah;
    } else {
      acc.push({
        name: item.nama_anggaran,
        value: item.jumlah,
        fill: `#${Math.floor(Math.random()*16777215).toString(16)}` // Random color
      });
    }
    return acc;
  }, []);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Memuat data...</span>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Anggaran
              </CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatRupiah(summary?.summary.total_anggaran || 0)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {summary?.nama_tpa || "TPA"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Entri
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {summary?.summary.jumlah_item || 0} Item
              </div>
              <p className="text-xs text-muted-foreground mt-1">Data tercatat</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Rata-rata
              </CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatRupiah(summary?.summary.rata_rata_anggaran || 0)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Per item</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Table */}
          <Card>
            <CardHeader>
              <div className="flex flex-col space-y-3">
                <div className="flex items-center justify-between">
                  <CardTitle>Rincian Anggaran</CardTitle>
                  <Button className="gap-2" onClick={handleAdd}>
                    <Plus className="h-4 w-4" />
                    Tambah
                  </Button>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Cari nama anggaran..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nama Anggaran</TableHead>
                      <TableHead className="text-right">Jumlah</TableHead>
                      <TableHead>Dibuat</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredData.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                          {data.length === 0 ? "Belum ada data anggaran" : "Tidak ada data yang ditemukan"}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredData.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.nama_anggaran}</TableCell>
                          <TableCell className="text-right font-bold text-primary">
                            {formatRupiah(item.jumlah)}
                          </TableCell>
                          <TableCell>
                            {new Date(item.created_at).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEdit(item)}
                                className="hover:bg-primary/10"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDelete(item.id)}
                                className="hover:bg-destructive/10"
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Visualisasi Distribusi Anggaran</CardTitle>
            </CardHeader>
            <CardContent>
              {chartData.length === 0 ? (
                <div className="flex items-center justify-center h-64 text-muted-foreground">
                  Tidak ada data untuk ditampilkan
                </div>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={90}
                        dataKey="value"
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number) => formatRupiah(value)}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="mt-4 space-y-2">
                    {chartData.map((item, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          <span className="text-muted-foreground">{item.name}</span>
                        </div>
                        <span className="font-semibold">{formatRupiah(item.value)}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Public Link */}
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Eye className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">Transparansi Anggaran Publik</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Lihat dan bagikan informasi anggaran kepada masyarakat
                  </p>
                </div>
              </div>
              <Link to="/anggaran-publik">
                <Button variant="outline" className="gap-2">
                  <Eye className="h-4 w-4" />
                  Buka Halaman Publik
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit Anggaran" : "Tambah Anggaran"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="nama_anggaran">Nama Anggaran</Label>
              <Input
                id="nama_anggaran"
                placeholder="Contoh: Gaji Pegawai, Operasional, dll."
                value={formData.nama_anggaran}
                onChange={(e) => setFormData({ ...formData, nama_anggaran: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="jumlah">Jumlah (Rp)</Label>
              <Input
                id="jumlah"
                type="number"
                placeholder="15000000"
                value={formData.jumlah}
                onChange={(e) => setFormData({ ...formData, jumlah: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={submitting}>
              Batal
            </Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {editingItem ? "Update" : "Simpan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default Anggaran;