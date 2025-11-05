import { useState } from "react";
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
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

interface Anggaran {
  id: string;
  tanggal: string;
  jumlah: number;
  tujuan: string;
}

const anggaranData: Anggaran[] = [
  { id: "001", tanggal: "2025-01-05", jumlah: 15000000, tujuan: "Gaji Pegawai" },
  { id: "002", tanggal: "2025-01-08", jumlah: 8500000, tujuan: "Operasional" },
  { id: "003", tanggal: "2025-01-10", jumlah: 12000000, tujuan: "Perawatan Kendaraan" },
  { id: "004", tanggal: "2025-01-12", jumlah: 10000000, tujuan: "Pembelian Alat" },
];

const chartData = [
  { name: "Gaji", value: 15000000, fill: "#22c55e" },
  { name: "Operasional", value: 8500000, fill: "#3b82f6" },
  { name: "Perawatan", value: 12000000, fill: "#f59e0b" },
  { name: "Pembelian", value: 10000000, fill: "#ef4444" },
];

const formatRupiah = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
};

const Anggaran = () => {
  const [data, setData] = useState<Anggaran[]>(anggaranData);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Anggaran | null>(null);
  const [formData, setFormData] = useState({
    tanggal: "",
    jumlah: "",
    tujuan: "",
  });

  const totalAnggaran = data.reduce((sum, item) => sum + item.jumlah, 0);

  const handleAdd = () => {
    setEditingItem(null);
    setFormData({ tanggal: "", jumlah: "", tujuan: "" });
    setIsDialogOpen(true);
  };

  const handleEdit = (item: Anggaran) => {
    setEditingItem(item);
    setFormData({
      tanggal: item.tanggal,
      jumlah: item.jumlah.toString(),
      tujuan: item.tujuan,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setData(data.filter(item => item.id !== id));
    toast.success("Data berhasil dihapus");
  };

  const handleSubmit = () => {
    if (!formData.tanggal || !formData.jumlah || !formData.tujuan) {
      toast.error("Semua field harus diisi");
      return;
    }

    if (editingItem) {
      setData(data.map(item => 
        item.id === editingItem.id 
          ? { ...item, ...formData, jumlah: Number(formData.jumlah) }
          : item
      ));
      toast.success("Data berhasil diupdate");
    } else {
      const newItem: Anggaran = {
        id: String(data.length + 1).padStart(3, "0"),
        tanggal: formData.tanggal,
        jumlah: Number(formData.jumlah),
        tujuan: formData.tujuan,
      };
      setData([...data, newItem]);
      toast.success("Data berhasil ditambahkan");
    }
    setIsDialogOpen(false);
  };

  const chartData = [
    { name: "Gaji", value: data.filter(d => d.tujuan.includes("Gaji")).reduce((sum, d) => sum + d.jumlah, 0), fill: "#22c55e" },
    { name: "Operasional", value: data.filter(d => d.tujuan.includes("Operasional")).reduce((sum, d) => sum + d.jumlah, 0), fill: "#3b82f6" },
    { name: "Perawatan", value: data.filter(d => d.tujuan.includes("Perawatan")).reduce((sum, d) => sum + d.jumlah, 0), fill: "#f59e0b" },
    { name: "Pembelian", value: data.filter(d => d.tujuan.includes("Pembelian")).reduce((sum, d) => sum + d.jumlah, 0), fill: "#ef4444" },
  ].filter(item => item.value > 0);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Summary Card */}
        <Card>
          <CardHeader>
            <CardTitle>Total Anggaran Bulan Ini</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-primary">{formatRupiah(totalAnggaran)}</p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Table */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Rincian Anggaran</CardTitle>
              <Button className="gap-2" onClick={handleAdd}>
                <Plus className="h-4 w-4" />
                Tambah
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Tujuan</TableHead>
                    <TableHead className="text-right">Jumlah</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.tanggal}</TableCell>
                      <TableCell>{item.tujuan}</TableCell>
                      <TableCell className="text-right font-medium">
                        {formatRupiah(item.jumlah)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(item)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(item.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Proporsi Anggaran</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => formatRupiah(value)}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Public Link */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Halaman Publik Anggaran</p>
                <p className="text-sm text-muted-foreground">
                  Bagikan data anggaran kepada publik
                </p>
              </div>
              <Link to="/anggaran-publik">
                <Button variant="outline">Lihat Halaman Publik</Button>
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
              <Label htmlFor="tanggal">Tanggal</Label>
              <Input
                id="tanggal"
                type="date"
                value={formData.tanggal}
                onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="tujuan">Tujuan</Label>
              <Input
                id="tujuan"
                placeholder="Contoh: Gaji Pegawai"
                value={formData.tujuan}
                onChange={(e) => setFormData({ ...formData, tujuan: e.target.value })}
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
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleSubmit}>
              {editingItem ? "Update" : "Simpan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default Anggaran;
