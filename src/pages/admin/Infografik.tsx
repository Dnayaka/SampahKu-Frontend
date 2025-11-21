import { useState, useEffect } from "react";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { TrendingUp, Recycle, Package2, Calendar, AlertCircle, Loader2, RefreshCw } from "lucide-react";

interface TPA {
  id_tpa: number;
  nama_tpa: string;
  alamat_tpa: string;
  status_tpa: string;
  assigned_at: string;
}

interface SampahStatistic {
  tpa: string;
  kategori: string;
  total_berat_kg: number;
}

interface UserTPAData {
  user_id: number;
  nama_user: string;
  tpa_list: TPA[];
}

interface SampahSummaryData {
  periode: {
    start_date: string;
    end_date: string;
    bulan: string;
  };
  ringkasan: {
    total_data: number;
    total_berat_kg: number;
    rata_rata_berat_kg: number;
    total_transaksi: number;
  };
  statistik_kategori: {
    id_kategorisampah: number;
    nama_kategorisampah: string;
    jumlah_transaksi: number;
    total_berat_kg: number;
    persentase_berat: number;
  }[];
  trend_harian: {
    tanggal: string;
    jumlah_transaksi: number;
    total_berat_kg: number;
  }[];
}

interface YearlyData {
  tahun: string;
  total: number;
}

const COLORS = ["#22c55e", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#84cc16", "#f97316"];

const Infografik = () => {
  const [categoryData, setCategoryData] = useState<{ name: string; value: number }[]>([]);
  const [yearlyData, setYearlyData] = useState<YearlyData[]>([]);
  const [currentTpa, setCurrentTpa] = useState<TPA | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summaryData, setSummaryData] = useState<SampahSummaryData | null>(null);
  const [dailyTrendData, setDailyTrendData] = useState<{ tanggal: string; total_berat_kg: number }[]>([]);

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

  // Get nama from cookies
  const getNamaFromCookies = (): string | null => {
    if (typeof document === 'undefined') return null;
    
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'nama') {
        return decodeURIComponent(value);
      }
    }
    return null;
  };

  // Format date to YYYY-MM for API
  const formatDateForAPI = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  };

  // Fetch monthly data
  const fetchMonthlyData = async (tpaId: number, yearMonth: string): Promise<SampahSummaryData | null> => {
    try {
      const response = await fetch(
        `http://${process.env.NEXT_PUBLIC_API_URL}/analytics/sampah-summary?id_tpa=${tpaId}&bulan=${yearMonth}`,
        {
          method: 'GET',
          headers: {
            'accept': 'application/json',
          },
        }
      );

      if (response.ok) {
        return await response.json();
      }
      return null;
    } catch (error) {
      console.error(`Error fetching data for ${yearMonth}:`, error);
      return null;
    }
  };

  // Fetch current month data
  const fetchCurrentMonthData = async (tpaId: number) => {
    try {
      const currentDate = new Date();
      const currentYearMonth = formatDateForAPI(currentDate);
      
      const data = await fetchMonthlyData(tpaId, currentYearMonth);
      if (data) {
        setSummaryData(data);
        
        // Transform category data for charts
        const transformedCategoryData = data.statistik_kategori.map((stat) => ({
          name: stat.nama_kategorisampah,
          value: stat.total_berat_kg,
        }));
        setCategoryData(transformedCategoryData);
        
        // Transform daily trend data
        const transformedDailyData = data.trend_harian.map((day) => ({
          tanggal: new Date(day.tanggal).getDate().toString(),
          total_berat_kg: day.total_berat_kg,
        }));
        setDailyTrendData(transformedDailyData);
        
        return data.ringkasan.total_berat_kg;
      }
      return 0;
    } catch (error) {
      console.error('Error fetching current month data:', error);
      return 0;
    }
  };

  // Fetch yearly data (aggregate from monthly data)
  const fetchYearlyData = async (tpaId: number) => {
    try {
      const currentYear = new Date().getFullYear();
      const yearlyPromises = [];
      
      // Fetch data for each month of the current year
      for (let month = 0; month < 12; month++) {
        const date = new Date(currentYear, month, 1);
        const yearMonth = formatDateForAPI(date);
        yearlyPromises.push(fetchMonthlyData(tpaId, yearMonth));
      }
      
      const monthlyResults = await Promise.all(yearlyPromises);
      
      // Aggregate by year (in this case, just current year)
      const yearlyTotals: { [year: string]: number } = {};
      
      monthlyResults.forEach((monthData, index) => {
        if (monthData) {
          const year = currentYear.toString();
          if (!yearlyTotals[year]) {
            yearlyTotals[year] = 0;
          }
          yearlyTotals[year] += monthData.ringkasan.total_berat_kg;
        }
      });
      
      // Transform to YearlyData format
      const transformedYearlyData = Object.entries(yearlyTotals).map(([tahun, total]) => ({
        tahun,
        total
      }));
      
      setYearlyData(transformedYearlyData);
    } catch (error) {
      console.error('Error fetching yearly data:', error);
    }
  };

  // Fetch all data from API
  const fetchData = async (showLoading: boolean = true) => {
    try {
      if (showLoading) setLoading(true);
      setRefreshing(true);
      setError(null);
      
      const userId = getUserIdFromCookies();
      if (!userId) {
        setError("User ID tidak ditemukan dalam cookies");
        if (showLoading) setLoading(false);
        setRefreshing(false);
        return;
      }

      // Fetch TPA data
      const tpaResponse = await fetch(`http://${process.env.NEXT_PUBLIC_API_URL}/tpa/user/${userId}/tpa`, {
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
        setError("Tidak ada TPA yang ditugaskan untuk user ini");
        if (showLoading) setLoading(false);
        setRefreshing(false);
        return;
      }

      // Use the first TPA
      const firstTpa = tpaData.tpa_list[0];
      setCurrentTpa(firstTpa);

      // Fetch current month data and yearly data in parallel
      await Promise.all([
        fetchCurrentMonthData(firstTpa.id_tpa),
        fetchYearlyData(firstTpa.id_tpa)
      ]);

    } catch (error) {
      console.error('Error fetching data:', error);
      setError("Gagal memuat data. Silakan refresh halaman atau coba lagi nanti.");
    } finally {
      if (showLoading) setLoading(false);
      setRefreshing(false);
    }
  };

  // Handle refresh
  const handleRefresh = () => {
    fetchData(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Calculate derived data
  const totalSampah = summaryData?.ringkasan.total_berat_kg || 0;
  const avgPerMonth = yearlyData.length > 0 
    ? yearlyData.reduce((sum, item) => sum + item.total, 0) / 12 // Average per month
    : 0;
  
  const highestCategory = categoryData.length > 0 
    ? categoryData.reduce((prev, current) => (prev.value > current.value) ? prev : current)
    : { name: "Tidak ada data", value: 0 };

  // Get recycle and non-recycle values
  const recycleData = categoryData.find(item => 
    item.name.toLowerCase().includes("recycle") || 
    item.name.toLowerCase().includes("daur ulang") ||
    item.name.toLowerCase().includes("organik")
  );
  
  const nonRecycleData = categoryData.find(item => 
    item.name.toLowerCase().includes("non") || 
    item.name.toLowerCase().includes("anorganik") ||
    item.name.toLowerCase().includes("plastik")
  );

  const namaUser = getNamaFromCookies();

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <div className="text-lg">Memuat data infografik...</div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <p className="text-lg font-medium mb-2">Gagal memuat data</p>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => fetchData()} variant="outline">
              Coba Lagi
            </Button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header & Summary */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">Infografik Data Sampah</h1>
            <p className="text-muted-foreground">
              {namaUser && `Selamat datang, ${namaUser}! `}
              Visualisasi data pengelolaan sampah yang mudah dipahami
            </p>
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
        </div>

        {/* TPA Info */}
        {currentTpa && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold">{currentTpa.nama_tpa}</h3>
                    <p className="text-sm text-muted-foreground">{currentTpa.alamat_tpa}</p>
                  </div>
                  <Badge 
                    className={`${
                      currentTpa.status_tpa === 'Aktif' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}
                    variant="outline"
                  >
                    {currentTpa.status_tpa}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Data ditampilkan untuk TPA yang ditugaskan kepada Anda
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Sampah (Bulan Ini)
              </CardTitle>
              <Package2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalSampah.toLocaleString()} kg</div>
              <p className="text-xs text-muted-foreground mt-1">
                {summaryData?.periode.bulan || `Bulan ${formatDateForAPI(new Date())}`}
                {currentTpa && ` • ${currentTpa.nama_tpa}`}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Rata-rata/Bulan
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{avgPerMonth.toFixed(0)} kg</div>
              <p className="text-xs text-muted-foreground mt-1">
                Rata-rata bulanan tahun {new Date().getFullYear()}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Kategori Tertinggi
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold truncate" title={highestCategory.name}>
                {highestCategory.name.length > 12 
                  ? `${highestCategory.name.substring(0, 12)}...` 
                  : highestCategory.name
                }
              </div>
              <p className="text-xs text-muted-foreground mt-1">{highestCategory.value.toLocaleString()} kg</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Recycle vs Non-recycle
              </CardTitle>
              <Recycle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(recycleData?.value || 0).toLocaleString()} : {(nonRecycleData?.value || 0).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Recycle : Non-recycle</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        {categoryData.length > 0 ? (
          <>
            {/* Total Sampah per Kategori */}
            <Card>
              <CardHeader>
                <CardTitle>📊 Total Sampah per Kategori</CardTitle>
                <CardDescription>
                  Perbandingan berat sampah berdasarkan kategori (dalam kilogram)
                  {currentTpa && ` • ${currentTpa.nama_tpa} • ${summaryData?.periode.bulan || `Bulan ${formatDateForAPI(new Date())}`}`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={categoryData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="name" 
                      stroke="hsl(var(--foreground))"
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis stroke="hsl(var(--foreground))" />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: "hsl(var(--background))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "6px",
                      }}
                      formatter={(value) => [`${Number(value).toLocaleString()} kg`, "Berat"]}
                    />
                    <Legend />
                    <Bar 
                      dataKey="value" 
                      fill="#22c55e" 
                      name="Berat (kg)" 
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Trend Harian */}
              <Card>
                <CardHeader>
                  <CardTitle>📈 Tren Harian Sampah</CardTitle>
                  <CardDescription>
                    Perkembangan sampah harian dalam bulan berjalan
                    {currentTpa && ` • ${currentTpa.nama_tpa}`}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={dailyTrendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="tanggal" stroke="hsl(var(--foreground))" />
                      <YAxis stroke="hsl(var(--foreground))" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--background))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "6px",
                        }}
                        formatter={(value) => [`${Number(value).toLocaleString()} kg`, "Total"]}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="total_berat_kg" 
                        stroke="#3b82f6" 
                        strokeWidth={3}
                        name="Total Harian (kg)" 
                        dot={{ fill: "#3b82f6", r: 5 }}
                        activeDot={{ r: 8 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Distribusi Kategori */}
              <Card>
                <CardHeader>
                  <CardTitle>📋 Distribusi Kategori Sampah</CardTitle>
                  <CardDescription>
                    Perbandingan jenis sampah yang terkumpul
                    {currentTpa && ` • ${currentTpa.nama_tpa} • ${summaryData?.periode.bulan || `Bulan ${formatDateForAPI(new Date())}`}`}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                        outerRadius={90}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--background))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "6px",
                        }}
                        formatter={(value, name) => [`${Number(value).toLocaleString()} kg`, name]}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    {categoryData.map((item, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate" title={item.name}>
                            {item.name}
                          </p>
                          <p className="text-xs text-muted-foreground">{item.value.toLocaleString()} kg</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Detail Kategori */}
            <Card>
              <CardHeader>
                <CardTitle>🎯 Detail Kategori Sampah</CardTitle>
                <CardDescription>
                  Proporsi setiap kategori terhadap total sampah
                  {currentTpa && ` • ${currentTpa.nama_tpa} • ${summaryData?.periode.bulan || `Bulan ${formatDateForAPI(new Date())}`}`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {categoryData.map((item, index) => {
                    const percentage = totalSampah > 0 ? ((item.value / totalSampah) * 100).toFixed(1) : "0";
                    return (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-4 h-4 rounded"
                              style={{ backgroundColor: COLORS[index % COLORS.length] }}
                            />
                            <span className="font-medium">{item.name}</span>
                          </div>
                          <span className="text-sm text-muted-foreground">{percentage}%</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full transition-all"
                              style={{
                                width: `${percentage}%`,
                                backgroundColor: COLORS[index % COLORS.length],
                              }}
                            />
                          </div>
                          <span className="text-sm font-semibold w-20 text-right">
                            {item.value.toLocaleString()} kg
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <Package2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium">Tidak ada data sampah</p>
                <p className="text-muted-foreground mt-1">
                  {currentTpa 
                    ? `Belum ada data sampah untuk ${currentTpa.nama_tpa} pada periode ini`
                    : "Tidak dapat memuat data TPA"
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Info Card */}
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold">Informasi Data</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {currentTpa ? (
                    <>
                      Data statistik pengelolaan sampah ditampilkan secara real-time dari sistem. 
                      Semua informasi yang ditampilkan diambil langsung dari database {currentTpa.nama_tpa}. 
                      Data mencakup periode {summaryData?.periode.bulan || `bulan ${formatDateForAPI(new Date())}`}. 
                      Visualisasi ini membantu dalam memahami tren dan pola pengelolaan sampah untuk pengambilan keputusan yang lebih baik.
                    </>
                  ) : (
                    "Memuat informasi data..."
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default Infografik;