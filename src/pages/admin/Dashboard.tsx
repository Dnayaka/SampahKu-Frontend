import { useEffect, useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Trash2, 
  Users, 
  TrendingUp, 
  DollarSign, 
  Clock,
  LogIn,
  Eye,
  Settings,
  User,
  Shield,
  Activity,
  MapPin,
  Phone,
  IdCard,
  RefreshCw,
  AlertCircle
} from "lucide-react";
import { format } from "date-fns";

// 🔹 Ambil cookie manual tanpa library
const getCookie = (name: string): string | null => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
  return null;
};

// 🔹 Timezone configuration dengan locale Indonesia
const TIMEZONES = {
  WIB: { offset: 7, label: "WIB (Jakarta, Sumatra, Jawa)", locale: "Asia/Jakarta" },
  WITA: { offset: 8, label: "WITA (Bali, Kalimantan, Sulawesi)", locale: "Asia/Makassar" },
  WIT: { offset: 9, label: "WIT (Papua, Maluku)", locale: "Asia/Jayapura" }
};

// 🔹 Mapping action ke bahasa Indonesia yang sederhana
const ACTION_TRANSLATIONS: { [key: string]: { text: string; icon: any; color: string } } = {
  "LOGIN_AUTH": { 
    text: "Login ke Sistem", 
    icon: LogIn, 
    color: "text-green-600" 
  },
  "HTTP_GET": { 
    text: "Melihat Data", 
    icon: Eye, 
    color: "text-blue-600" 
  },
  "HTTP_POST": { 
    text: "Menambah Data Baru", 
    icon: Activity, 
    color: "text-green-600" 
  },
  "HTTP_PUT": { 
    text: "Mengubah Data", 
    icon: Settings, 
    color: "text-orange-600" 
  },
  "HTTP_DELETE": { 
    text: "Menghapus Data", 
    icon: Trash2, 
    color: "text-red-600" 
  },
  "USER_CREATE": { 
    text: "Membuat User Baru", 
    icon: User, 
    color: "text-purple-600" 
  },
  "USER_UPDATE": { 
    text: "Mengubah User", 
    icon: User, 
    color: "text-orange-600" 
  },
  "SYSTEM_UPDATE": { 
    text: "Update Sistem", 
    icon: Settings, 
    color: "text-blue-600" 
  },
  "MANUAL_LOGS_CLEANUP_START": {
    text: "Membersihkan Log Sistem",
    icon: Trash2,
    color: "text-red-600"
  },
  "MANUAL_LOGS_CLEANUP_COMPLETE": {
    text: "Selesai Membersihkan Log",
    icon: Trash2,
    color: "text-green-600"
  },
  "DELETE_SYSTEM_LOG": {
    text: "Menghapus Log Sistem",
    icon: Trash2,
    color: "text-red-600"
  }
};

// 🔹 Default action untuk fallback
const DEFAULT_ACTION = { 
  text: "Aktivitas Sistem", 
  icon: Activity, 
  color: "text-gray-600" 
};

const Dashboard = () => {
  const [idTpa, setIdTpa] = useState<number | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [totalSampah, setTotalSampah] = useState<string>("0 Ton");
  const [totalUser, setTotalUser] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [logsTpa, setLogsTpa] = useState<any[]>([]);
  const [logsUser, setLogsUser] = useState<any[]>([]);
  const [selectedTimezone, setSelectedTimezone] = useState<keyof typeof TIMEZONES>("WIB");
  const [userList, setUserList] = useState<any[]>([]);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [alamatAktifCount, setAlamatAktifCount] = useState<number>(0);




  // 🔹 Ambil data dari cookie
  useEffect(() => {
    try {
      const userInfoCookie = getCookie("user_info");
      const token = getCookie("access_token");
      const uid = getCookie("user_id");

      if (!token) {
        console.warn("⚠️ Token access_token tidak ditemukan di cookies");
        setError("Token akses tidak ditemukan. Silakan login kembali.");
      }

      if (userInfoCookie) {
        const userInfo = JSON.parse(userInfoCookie);
        const tpaId = userInfo?.tpa_list?.[0]?.id_tpa || 1;
        setIdTpa(tpaId);
      } else {
        console.warn("⚠️ Cookie user_info tidak ditemukan, fallback ke id_tpa=1");
        setIdTpa(1);
      }

      if (uid) setUserId(parseInt(uid));
    } catch (err) {
      console.error("Gagal parsing cookie user_info:", err);
      setIdTpa(1);
      setError("Gagal memuat informasi pengguna.");
    }
  }, []);

  // 🔹 Format waktu yang lebih reliable dengan built-in JavaScript Date
  const formatTimeForHumans = (utcDateString: string, timezone: keyof typeof TIMEZONES = "WIB") => {
    try {
      if (!utcDateString) return "Waktu tidak tersedia";
      
      // Handle berbagai format timestamp
      let utcDate: Date;
      
      if (utcDateString.includes('+') || utcDateString.includes('Z')) {
        // Jika sudah ada timezone info
        utcDate = new Date(utcDateString);
      } else {
        // Jika tidak ada timezone, anggap sebagai UTC
        utcDate = new Date(utcDateString + 'Z');
      }
      
      if (isNaN(utcDate.getTime())) {
        // Fallback: coba parse sebagai local time
        utcDate = new Date(utcDateString);
        if (isNaN(utcDate.getTime())) {
          console.warn("Invalid date string:", utcDateString);
          return "Waktu tidak valid";
        }
      }

      const timezoneConfig = TIMEZONES[timezone];
      
      // Konversi ke waktu lokal dengan timezone yang dipilih
      const localTimeString = utcDate.toLocaleString('en-US', { 
        timeZone: timezoneConfig.locale 
      });
      const localTime = new Date(localTimeString);
      
      const now = new Date();
      const nowInTimezone = new Date(now.toLocaleString('en-US', { 
        timeZone: timezoneConfig.locale 
      }));
      
      const diffMs = nowInTimezone.getTime() - localTime.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      // Format yang sangat user-friendly
      if (diffMins < 1) {
        return "Baru saja";
      } else if (diffMins < 60) {
        return `${diffMins} menit yang lalu`;
      } else if (diffHours < 24) {
        return `${diffHours} jam yang lalu`;
      } else if (diffDays === 1) {
        return "Kemarin";
      } else if (diffDays < 7) {
        return `${diffDays} hari yang lalu`;
      } else {
        // Untuk waktu yang lebih dari seminggu, tampilkan tanggal lengkap
        return localTime.toLocaleDateString('id-ID', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      }
    } catch (error) {
      console.error("Error formatting time:", error, "Input:", utcDateString);
      return "Waktu tidak valid";
    }
  };

  // 🔹 Format detail waktu untuk tooltip
  const formatDetailedTime = (utcDateString: string, timezone: keyof typeof TIMEZONES = "WIB") => {
    try {
      if (!utcDateString) return "Waktu tidak tersedia";
      
      let utcDate: Date;
      
      if (utcDateString.includes('+') || utcDateString.includes('Z')) {
        utcDate = new Date(utcDateString);
      } else {
        utcDate = new Date(utcDateString + 'Z');
      }
      
      if (isNaN(utcDate.getTime())) {
        utcDate = new Date(utcDateString);
        if (isNaN(utcDate.getTime())) return "Waktu tidak valid";
      }

      const timezoneConfig = TIMEZONES[timezone];
      
      return utcDate.toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZone: timezoneConfig.locale
      }) + ` ${timezone}`;
    } catch (error) {
      console.error("Error formatting detailed time:", error);
      return "Waktu tidak valid";
    }
  };

  // 🔹 Terjemahkan action ke bahasa Indonesia
  const translateAction = (action: string, description: string) => {
    if (!action) return DEFAULT_ACTION;
    
    if (ACTION_TRANSLATIONS[action]) {
      return ACTION_TRANSLATIONS[action];
    }

    // Fallback: coba terjemahkan berdasarkan description
    if (description?.includes('login') || description?.includes('LOGIN')) {
      return { text: "Login ke Sistem", icon: LogIn, color: "text-green-600" };
    } else if (description?.includes('GET') || description?.includes('lihat')) {
      return { text: "Melihat Data", icon: Eye, color: "text-blue-600" };
    } else if (description?.includes('POST') || description?.includes('tambah')) {
      return { text: "Menambah Data", icon: Activity, color: "text-green-600" };
    } else if (description?.includes('PUT') || description?.includes('ubah')) {
      return { text: "Mengubah Data", icon: Settings, color: "text-orange-600" };
    } else if (description?.includes('DELETE') || description?.includes('hapus')) {
      return { text: "Menghapus Data", icon: Trash2, color: "text-red-600" };
    }

    // Default
    return DEFAULT_ACTION;
  };

  // 🔹 Sederhanakan deskripsi
  const simplifyDescription = (description: string) => {
    if (!description) return "Aktivitas sistem";
    
    // Hapus informasi teknis seperti status code dan waktu response
    let simpleDesc = description
      .replace(/ - Status: \d+ - Time: [\d.]+s/, '')
      .replace(/GET /, 'Akses ')
      .replace(/POST /, 'Kirim ')
      .replace(/PUT /, 'Ubah ')
      .replace(/DELETE /, 'Hapus ')
      .replace(/LOGIN on AUTH/, 'Login')
      .replace(/User logged in successfully/, 'berhasil login');

    // Buat lebih natural
    if (simpleDesc.includes('/system-logs')) {
      simpleDesc = 'Melihat log sistem';
    } else if (simpleDesc.includes('/sampah-tpa/stats')) {
      simpleDesc = 'Melihat statistik sampah';
    } else if (simpleDesc.includes('/tpa/') && simpleDesc.includes('/users')) {
      simpleDesc = 'Melihat data pengguna';
    } else if (simpleDesc.includes('cleanup')) {
      simpleDesc = 'Membersihkan data sistem';
    } else if (simpleDesc.includes('delete') || simpleDesc.includes('hapus')) {
      simpleDesc = 'Menghapus data';
    }

    return simpleDesc || "Aktivitas sistem";
  };

  // 🔹 Proses log data dengan safe handling
  const processLogData = (log: any) => {
    const translatedAction = translateAction(log.rawAction, log.rawDescription);
    
    return {
      id: log.id || Math.random().toString(),
      rawAction: log.rawAction,
      rawDescription: log.rawDescription,
      rawUTC: log.rawUTC,
      ip: log.ip || "Tidak diketahui",
      userAgent: log.userAgent || "Tidak diketahui",
      userName: log.userName || "Pengguna tidak dikenal",
      displayTime: formatTimeForHumans(log.rawUTC, selectedTimezone),
      detailedTime: formatDetailedTime(log.rawUTC, selectedTimezone),
      translatedAction: translatedAction,
      simpleDescription: simplifyDescription(log.rawDescription),
      safeIcon: translatedAction.icon || Activity
    };
  };

  // 🔹 Fungsi fetch data yang reusable
  const fetchDashboardData = async (idTpa: number, userId: number | null, token: string) => {
    try {
      setError(null);
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 1);
      const startDateStr = format(startDate, "yyyy-MM-dd");

      const headers = {
        accept: "application/json",
        Authorization: `Bearer ${token}`,
      };

      console.log("🔄 Memuat data dashboard...", new Date().toLocaleTimeString());

      // 🔹 Fetch total sampah
      const sampahRes = await fetch(
        `http://${process.env.NEXT_PUBLIC_API_URL}sampah/tpa/stats?id_tpa=${idTpa}`,
        { headers }
      );
      
      if (!sampahRes.ok) {
        throw new Error(`HTTP error! status: ${sampahRes.status}`);
      }
      
      const sampahData = await sampahRes.json();
      console.log("📊 Data sampah terbaru:", sampahData);

      if (Array.isArray(sampahData.sampah_statistics)) {
        const totalKg = sampahData.sampah_statistics.reduce(
          (sum: number, item: any) => sum + (item.total_berat_kg || 0),
          0
        );
        const totalTon = totalKg / 1000;
        setTotalSampah(`${totalTon.toLocaleString("id-ID", { minimumFractionDigits: 2 })} Ton`);
      }

      // 🔹 Fetch data user dari endpoint Tpa Id Users
      try {
        const userRes = await fetch(
          `http://${process.env.NEXT_PUBLIC_API_URL}/tpa/${idTpa}/users`,
          { headers }
        );

        if (userRes.ok) {
          const userData = await userRes.json();
          console.log("👥 Data user dari endpoint /tpa/{id}/users:", userData);

          // ✅ sesuai format output:
          // { "tpa_id": 1, "nama_tpa": "Tpa Ble Banyumas", "user_list": [...] }

          // 🔹 Ambil detail tiap user secara paralel
          const detailedUsers = await Promise.all(
            (userData.user_list || []).map(async (u: any) => {
              try {
                const detailRes = await fetch(
                  `http://${process.env.NEXT_PUBLIC_API_URL}/users/get-user-detail/${u.id_user}`,
                  { headers }
                );
                const detail = detailRes.ok ? await detailRes.json() : null;
                return detail || u;
              } catch (err) {
                console.error("❌ Gagal ambil detail user:", err);
                return u;
              }
            })
          );

          console.log("✅ Semua data user lengkap:", detailedUsers);

          setTotalUser(detailedUsers.length);
          setUserList(detailedUsers);
        } else {
          console.warn("⚠️ Gagal fetch data user:", userRes.status);
          setTotalUser(0);
          setUserList([]);
        }
      } catch (userError) {
        console.error("❌ Error fetch data user:", userError);
        setTotalUser(0);
        setUserList([]);
      }


      // 🔹 Fetch data alamat aktif user per TPA
      try {
        const res = await fetch(`http://${process.env.NEXT_PUBLIC_API_URL}/tpa/alamat-aktif-user/${idTpa}`, { headers });
        if (res.ok) {
          const data = await res.json();
          console.log("📍 Data alamat aktif user:", data);
          setAlamatAktifCount(data.user_aktif_count || 0);
        } else {
          console.warn("⚠️ Gagal fetch alamat aktif user:", res.status);
        }
      } catch (err) {
        console.error("❌ Error fetch alamat aktif user:", err);
      }


      // 🔹 Fetch system logs 
      try {
        const logsTpaRes = await fetch(`http://${process.env.NEXT_PUBLIC_API_URL}/system-logs/?skip=0&limit=100&tpa_id=${idTpa}`, {
          headers,
        });
        
        if (logsTpaRes.ok) {
          const logsTpaData = await logsTpaRes.json();
          console.log("📝 Logs TPA Data terbaru:", logsTpaData);
          
          const sortedTpaLogs = (logsTpaData?.logs || []).sort(
            (a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
          
          const processedTpaLogs = sortedTpaLogs.map((log: any) => 
            processLogData({
              id: log.id,
              rawAction: log.action,
              rawDescription: log.description,
              rawUTC: log.created_at,
              ip: log.ip_address,
              userAgent: log.user_agent,
              userName: log.user_name
            })
          );
          
          setLogsTpa(processedTpaLogs);
        } else {
          console.warn("⚠️ Gagal fetch logs TPA:", logsTpaRes.status);
          setLogsTpa([]);
        }
      } catch (logError) {
        console.error("❌ Error fetch logs TPA:", logError);
        setLogsTpa([]);
      }

      setLastRefresh(new Date());
    } catch (err) {
      console.error("❌ Gagal fetch data dashboard:", err);
      setError("Gagal memuat data dashboard. Silakan refresh halaman.");
      setTotalSampah("0 Ton");
      setTotalUser(0);
      setLogsTpa([]);
      setLogsUser([]);
      setUserList([]);
    }
  };

  // 🔹 Effect utama untuk fetch data
  useEffect(() => {
    if (!idTpa) return;
    const token = getCookie("access_token");

    if (!token) {
      console.error("❌ Tidak ada token access_token di cookies!");
      setIsLoading(false);
      setError("Token akses tidak ditemukan. Silakan login kembali.");
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      await fetchDashboardData(idTpa, userId, token);
      setIsLoading(false);
    };

    fetchData();
  }, [idTpa, userId]);

  // 🔹 Auto-refresh setiap 30 detik
  useEffect(() => {
    if (!idTpa || !autoRefresh) return;
    const token = getCookie("access_token");
    if (!token) return;

    const interval = setInterval(async () => {
      console.log("🔄 Auto-refresh data...", new Date().toLocaleTimeString());
      await fetchDashboardData(idTpa, userId, token);
    }, 300000); // 30 detik

    return () => clearInterval(interval);
  }, [idTpa, userId, autoRefresh]);

  // 🔹 Effect untuk update format waktu ketika timezone berubah
  useEffect(() => {
    const updateLogsWithNewTimezone = () => {
      if (logsTpa.length > 0) {
        const updatedTpaLogs = logsTpa.map(log => 
          processLogData({
            id: log.id,
            rawAction: log.rawAction,
            rawDescription: log.rawDescription,
            rawUTC: log.rawUTC,
            ip: log.ip,
            userAgent: log.userAgent,
            userName: log.userName
          })
        );
        setLogsTpa(updatedTpaLogs);
      }

      if (logsUser.length > 0) {
        const updatedUserLogs = logsUser.map(log => 
          processLogData({
            id: log.id,
            rawAction: log.rawAction,
            rawDescription: log.rawDescription,
            rawUTC: log.rawUTC,
            ip: log.ip,
            userAgent: log.userAgent,
            userName: log.userName
          })
        );
        setLogsUser(updatedUserLogs);
      }
    };

    updateLogsWithNewTimezone();
  }, [selectedTimezone]);

  // 🔹 Data statistik utama
  const statsData = [
    {
      title: "Total Sampah",
      value: isLoading ? "Memuat..." : totalSampah,
      description: "Jumlah sampah yang terkumpul",
      icon: Trash2,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Total Pelanggan",
      value: isLoading ? "Memuat..." : totalUser.toString(),
      description: "Jumlah pengguna aktif",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Rute Aktif",
      value: isLoading
        ? "Memuat..."
        : alamatAktifCount?.toString() || "0",
      description: "Jumlah user dengan alamat aktif",
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },


    {
      title: "Anggaran Bulan Ini",
      value: "Rp 45.5 jt",
      description: "Anggaran",
      icon: DollarSign,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
  ];

  // 🔹 Komponen untuk menampilkan log item
  const LogItem = ({ item, type }: { item: any; type: 'tpa' | 'user' }) => {
    const actionInfo = item.translatedAction || DEFAULT_ACTION;
    const ActionIcon = actionInfo.icon || Activity;
    
    return (
      <div className="p-4 hover:bg-gray-50 transition-colors border-b">
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-full bg-gray-100 ${actionInfo.color}`}>
            <ActionIcon className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-medium text-gray-900">
                {actionInfo.text}
              </p>
              <span className={`text-xs px-2 py-1 rounded-full ${
                type === 'tpa' 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-green-100 text-green-800'
              }`}>
                {type === 'tpa' ? item.userName : 'Anda'}
              </span>
            </div>
            
            <p className="text-gray-600 mt-1 text-sm">
              {item.simpleDescription}
            </p>
            
            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
              <span className="flex items-center gap-1" title={item.detailedTime}>
                <Clock className="h-3 w-3" />
                {item.displayTime}
              </span>
              <span title={`IP: ${item.ip}`}>
                📍 {item.ip}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 🔹 Komponen untuk menampilkan data user

const UserCard = ({ userDetail }: { userDetail: any }) => {
  const alamatUtama = userDetail.alamat?.[0] || {}; // ambil alamat pertama
  const modeAlamat = userDetail.nama_alamatmode?.[0] || "Tidak diketahui";

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {/* Nama */}
            <div className="flex items-center gap-2 mb-2">
              <User className="h-4 w-4 text-blue-600" />
              <h3 className="font-semibold text-lg">
                {userDetail.nama || "Nama tidak tersedia"}
              </h3>
            </div>

            {/* Detail Info */}
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <IdCard className="h-3 w-3 text-gray-500" />
                <span>ID User: {userDetail.id_user || "-"}</span>
              </div>

              <div className="flex items-center gap-2">
                <Phone className="h-3 w-3 text-gray-500" />
                <span>Telp: {userDetail.no_telepon || "Tidak ada"}</span>
              </div>

              <div className="flex items-start gap-2">
                <MapPin className="h-3 w-3 text-gray-500 mt-0.5" />
                <div>
                  <span className="font-medium">Alamat:</span>
                  <p className="text-gray-600">
                    {alamatUtama.lokasi_alamat || "Alamat tidak tersedia"}
                  </p>
                </div>
              </div>

              {alamatUtama.latitude && alamatUtama.longitude && (
                <div className="text-xs text-gray-500">
                  Koordinat:{" "}
                  {parseFloat(alamatUtama.latitude).toFixed(6)},{" "}
                  {parseFloat(alamatUtama.longitude).toFixed(6)}
                </div>
              )}
            </div>
          </div>

          {/* Status Mode Alamat */}
          <div className="text-right text-xs text-gray-500">
            <div
              className={`${
                modeAlamat === "aktif"
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-200 text-gray-600"
              } px-2 py-1 rounded-full mb-2`}
            >
              {modeAlamat.charAt(0).toUpperCase() + modeAlamat.slice(1)}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};


  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header dengan controls */}
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Dashboard Sistem</h1>
            <p className="text-muted-foreground mt-1">
              Ringkasan aktivitas dan statistik sistem pengelolaan sampah
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            {/* Timezone Selector */}


            {/* Manual Refresh Button */}
            <button
              onClick={async () => {
                if (!idTpa) return;
                const token = getCookie("access_token");
                if (!token) return;
                
                setIsLoading(true);
                await fetchDashboardData(idTpa, userId, token);
                setIsLoading(false);
              }}
              disabled={isLoading}
              className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 text-sm transition-colors"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? "Memuat..." : "Refresh"}
            </button>

            {/* Auto-refresh Toggle */}
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                autoRefresh 
                  ? 'bg-green-600 text-white hover:bg-green-700' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <Activity className="h-4 w-4" />
              Auto refresh setiap 5 menit: {autoRefresh ? 'ON' : 'OFF'}
            </button>

            {/* Last Refresh Info */}
            <div className="text-xs text-gray-500 bg-gray-100 px-3 py-2 rounded-md">
              Terakhir: {lastRefresh.toLocaleTimeString('id-ID')}
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-red-800">Terjadi Kesalahan</h3>
                <p className="text-red-700 text-sm mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Timezone Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-blue-800">Dalam tahap pengembangan</h3>
              <p className="text-blue-700 text-sm mt-1">
                Aplikasi ini masih dalam tahap pengembangan, jika menemukan Bug bisa menghubungi ... .
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statsData.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title} className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div>
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
                  </div>
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Data Pelanggan Aktif */}
        <Card>
          <CardHeader className="bg-gradient-to-r from-green-50 to-white">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-green-600" />
              Data Pelanggan Aktif ({totalUser} Orang)
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Daftar pengguna yang terdaftar dan memiliki alamat aktif di sistem
            </p>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-3"></div>
                <p className="text-gray-500">Memuat data pelanggan...</p>
              </div>
            ) : userList.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {userList.map((user, index) => (
                  <UserCard key={index} userDetail={user} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Belum ada data pelanggan</p>
                <p className="text-sm text-gray-400 mt-1">
                  Data pelanggan akan muncul di sini
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Log TPA */}
        <Card>
          <CardHeader className="flex flex-col lg:flex-row lg:items-center lg:justify-between bg-gradient-to-r from-blue-50 to-white gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-600" />
                Aktivitas Sistem
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Catatan semua aktivitas yang terjadi di sistem Tempat Pembuangan Akhir
              </p>
            </div>
            <div className="text-sm">
              <span className="font-medium">Zona Waktu: </span>
              <span className="text-muted-foreground">{TIMEZONES[selectedTimezone].label}</span>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y max-h-96 overflow-y-auto">
              {isLoading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
                  <p className="text-gray-500">Memuat catatan aktivitas...</p>
                </div>
              ) : logsTpa.length > 0 ? (
                logsTpa.map((item) => (
                  <LogItem key={item.id} item={item} type="tpa" />
                ))
              ) : (
                <div className="p-8 text-center">
                  <Activity className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Belum ada aktivitas sistem</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Aktivitas sistem akan muncul di sini
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Help Panel */}
        <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-800">
              <Activity className="h-5 w-5" />
              Cara Membaca Dashboard Ini
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-1.5"></div>
                  <span><strong>Waktu:</strong> Ditampilkan dalam bahasa Indonesia</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-1.5"></div>
                  <span><strong>Auto-refresh:</strong> Data diperbarui otomatis setiap 5 Menit</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-1.5"></div>
                  <span><strong>Aktivitas:</strong> Diterjemahkan ke bahasa sehari-hari</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-1.5"></div>
                  <span><strong>Warna:</strong> Hijau = login/tambah, Biru = lihat, Oranye = ubah, Merah = hapus</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-1.5"></div>
                  <span><strong>Ikon:</strong> Menunjukkan jenis aktivitas</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-1.5"></div>
                  <span><strong>Statistik:</strong> Data real-time dari sistem</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;
