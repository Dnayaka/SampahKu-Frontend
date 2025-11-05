import { useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface DataSampah {
  id: string;
  kategori: string;
  berat: number;
  tanggal: string;
  lokasi: string;
}

const initialData: DataSampah[] = [
  { id: "001", kategori: "Rumah Tangga", berat: 45.5, tanggal: "2025-01-10", lokasi: "Wilayah A RT 01" },
  { id: "002", kategori: "Organik", berat: 32.0, tanggal: "2025-01-10", lokasi: "Wilayah B RT 02" },
  { id: "003", kategori: "Anorganik", berat: 28.5, tanggal: "2025-01-09", lokasi: "Wilayah A RT 03" },
  { id: "004", kategori: "Elektronik", berat: 15.0, tanggal: "2025-01-09", lokasi: "Wilayah C RT 01" },
];

const DataSampah = () => {
  const [data, setData] = useState<DataSampah[]>(initialData);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    kategori: "",
    berat: "",
    tanggal: "",
    lokasi: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newData: DataSampah = {
      id: String(data.length + 1).padStart(3, "0"),
      kategori: formData.kategori,
      berat: parseFloat(formData.berat),
      tanggal: formData.tanggal,
      lokasi: formData.lokasi,
    };

    setData([newData, ...data]);
    setOpen(false);
    setFormData({ kategori: "", berat: "", tanggal: "", lokasi: "" });
    toast.success("Data sampah berhasil ditambahkan!");
  };

  const handleDelete = (id: string) => {
    setData(data.filter(item => item.id !== id));
    toast.success("Data berhasil dihapus!");
  };

  return (
    <AdminLayout>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Data Sampah</CardTitle>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Tambah Data
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Tambah Data Sampah</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Kategori</Label>
                  <Select
                    value={formData.kategori}
                    onValueChange={(value) => setFormData({ ...formData, kategori: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih kategori" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Rumah Tangga">Rumah Tangga</SelectItem>
                      <SelectItem value="Organik">Organik</SelectItem>
                      <SelectItem value="Anorganik">Anorganik</SelectItem>
                      <SelectItem value="Elektronik">Elektronik</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Berat (kg)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={formData.berat}
                    onChange={(e) => setFormData({ ...formData, berat: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tanggal</Label>
                  <Input
                    type="date"
                    value={formData.tanggal}
                    onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Lokasi</Label>
                  <Input
                    value={formData.lokasi}
                    onChange={(e) => setFormData({ ...formData, lokasi: e.target.value })}
                    placeholder="Contoh: Wilayah A RT 01"
                    required
                  />
                </div>
                <Button type="submit" className="w-full">Simpan</Button>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Berat (kg)</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead>Lokasi</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.id}</TableCell>
                  <TableCell>{item.kategori}</TableCell>
                  <TableCell>{item.berat}</TableCell>
                  <TableCell>{item.tanggal}</TableCell>
                  <TableCell>{item.lokasi}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(item.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default DataSampah;
