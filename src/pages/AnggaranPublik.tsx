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
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Recycle, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const anggaranData = [
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

const AnggaranPublik = () => {
  const totalAnggaran = anggaranData.reduce((sum, item) => sum + item.jumlah, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <header className="bg-card border-b shadow-sm">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Recycle className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="font-bold text-xl">Anggaran Publik</h1>
              <p className="text-xs text-muted-foreground">Sistem Manajemen Sampah</p>
            </div>
          </div>
          <Link to="/">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Kembali
            </Button>
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-6 py-8 space-y-6">
        {/* Summary */}
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
            <CardHeader>
              <CardTitle>Rincian Anggaran</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Tujuan</TableHead>
                    <TableHead className="text-right">Jumlah</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {anggaranData.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.tanggal}</TableCell>
                      <TableCell>{item.tujuan}</TableCell>
                      <TableCell className="text-right font-medium">
                        {formatRupiah(item.jumlah)}
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

        {/* Info */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground text-center">
              Data anggaran ini dipublikasikan untuk transparansi pengelolaan sampah
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AnggaranPublik;
