import { useState, useEffect } from "react";
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
import { Recycle, ArrowLeft, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

interface Anggaran {
  id: number;
  nama_anggaran: string;
  jumlah: number;
  created_at: string;
  updated_at: string;
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

const AnggaranPublik = () => {
  const [data, setData] = useState<Anggaran[]>([]);
  const [summary, setSummary] = useState<SummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [tpaId] = useState(1); // Ganti dengan TPA ID yang sesuai

  // Fetch data anggaran
  const fetchAnggaran = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/tpa/${tpaId}/anggaran`);
      if (!response.ok) throw new Error("Gagal mengambil data anggaran");
      const result = await response.json();
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
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="flex items-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Memuat data anggaran...</span>
        </div>
      </div>
    );
  }

  const totalAnggaran = summary?.summary.total_anggaran || 0;

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
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Anggaran
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {formatRupiah(totalAnggaran)}
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
              <CardTitle>Rincian Anggaran</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nama Anggaran</TableHead>
                      <TableHead className="text-right">Jumlah</TableHead>
                      <TableHead>Dibuat</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                          Belum ada data anggaran
                        </TableCell>
                      </TableRow>
                    ) : (
                      data.map((item) => (
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

        {/* Info */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">
                Data anggaran ini dipublikasikan untuk transparansi pengelolaan sampah
              </p>
              <p className="text-xs text-muted-foreground">
                Terakhir diperbarui: {new Date().toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AnggaranPublik;