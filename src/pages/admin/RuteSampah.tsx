import { useState, useEffect } from "react";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, RefreshCw, Search, ExternalLink } from "lucide-react";
import { toast } from "sonner";

interface RoutePoint {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

interface UserAddress {
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
  alamat: UserAddress[];
}

interface TPAUser {
  id_user: number;
  nama: string;
  no_telepon: string;
  assigned_at: string;
}

interface TPAUsersResponse {
  tpa_id: number;
  nama_tpa: string;
  user_list: TPAUser[];
}

interface TPA {
  id_tpa: number;
  nama_tpa: string;
  alamat_tpa: string;
  status_tpa: string;
  assigned_at: string;
}

interface TPAResponse {
  user_id: number;
  nama_user: string;
  tpa_list: TPA[];
}

const RuteSampah = () => {
  const [routes, setRoutes] = useState<RoutePoint[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  // Function to get cookie value
  const getCookie = (name: string): string | null => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    return null;
  };

  // Fetch data from APIs
  const fetchRouteData = async () => {
    try {
      setLoading(true);
      
      // Get user_id from cookies
      const userId = getCookie('user_id');
      if (!userId) {
        toast.error("User ID tidak ditemukan dalam cookies");
        return;
      }

      // Step 1: Get TPA list for user
      const tpaResponse = await fetch(`http://localhost:8000/tpa/user/${userId}/tpa`, {
        headers: {
          'accept': 'application/json',
        }
      });

      if (!tpaResponse.ok) {
        throw new Error('Gagal mengambil data TPA');
      }

      const tpaData: TPAResponse = await tpaResponse.json();
      
      if (!tpaData.tpa_list || tpaData.tpa_list.length === 0) {
        setRoutes([]);
        toast.info("Tidak ada TPA yang ditugaskan untuk user ini");
        return;
      }

      // Take the first TPA
      const tpaId = tpaData.tpa_list[0].id_tpa;

      // Step 2: Get users for this TPA
      const usersResponse = await fetch(`http://localhost:8000/tpa/${tpaId}/users`, {
        headers: {
          'accept': 'application/json',
        }
      });

      if (!usersResponse.ok) {
        throw new Error('Gagal mengambil data pengguna TPA');
      }

      const usersData: TPAUsersResponse = await usersResponse.json();
      
      // Step 3: Get details for each user and extract addresses
      const routePoints: RoutePoint[] = [];
      
      for (const user of usersData.user_list) {
        const userDetailResponse = await fetch(`http://localhost:8000/users/get-user-detail/${user.id_user}`, {
          headers: {
            'accept': 'application/json',
          }
        });

        if (userDetailResponse.ok) {
          const userDetail: UserDetail = await userDetailResponse.json();
          
          // Process each address
          if (userDetail.alamat && userDetail.alamat.length > 0) {
            userDetail.alamat.forEach((address, index) => {
              routePoints.push({
                id: `${userDetail.id_user}-${index}`,
                name: userDetail.nama,
                lat: address.latitude,
                lng: address.longitude
              });
            });
          }
        }
      }

      setRoutes(routePoints);

    } catch (error) {
      console.error('Error fetching route data:', error);
      toast.error("Gagal memuat data rute");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRouteData();
  }, []);

  // Generate Google Maps URL for overview
  const getMapUrl = () => {
    if (routes.length === 0) {
      return `https://maps.google.com/maps?q=-6.2088,106.8456&t=&z=15&ie=UTF8&iwloc=&output=embed`;
    }

    // Calculate center point for overview
    const lats = routes.map(r => r.lat);
    const lngs = routes.map(r => r.lng);
    const centerLat = (Math.min(...lats) + Math.max(...lats)) / 2;
    const centerLng = (Math.min(...lngs) + Math.max(...lngs)) / 2;
    
    return `https://maps.google.com/maps?q=${centerLat},${centerLng}&z=13&output=embed`;
  };

  const filteredRoutes = routes.filter(route =>
    route.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRefresh = () => {
    fetchRouteData();
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Memuat data rute...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Titik Rute</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{routes.length}</div>
              <p className="text-xs text-muted-foreground">Lokasi pengambilan sampah</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Status Rute</CardTitle>
              <RefreshCw className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">Aktif</div>
              <p className="text-xs text-muted-foreground">Semua rute beroperasi</p>
            </CardContent>
          </Card>
        </div>

        {/* Map */}
        <Card>
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle>Peta Rute Pengambilan Sampah</CardTitle>
            <Button variant="outline" onClick={handleRefresh} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Refresh Data
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="relative w-full h-96 rounded-lg overflow-hidden border">
                <iframe
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                  src={getMapUrl()}
                  className="rounded-lg"
                />
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Menampilkan overview {routes.length} titik lokasi pengambilan sampah
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Route Points List */}
        <Card>
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle>Daftar Titik Lokasi</CardTitle>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari lokasi..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredRoutes.length === 0 ? (
              <div className="text-center py-12">
                <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  {searchTerm ? "Tidak ada lokasi yang ditemukan" : "Belum ada titik lokasi"}
                </p>
                <Button onClick={handleRefresh} className="mt-4 gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Muat Ulang Data
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredRoutes.map((route, index) => (
                  <div
                    key={route.id}
                    className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-semibold text-primary">{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium">{route.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Lat: {route.lat.toFixed(4)}, Lng: {route.lng.toFixed(4)}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => window.open(`https://www.google.com/maps?q=${route.lat},${route.lng}`, '_blank')}
                        title="Buka di Google Maps"
                      >
                        <ExternalLink className="h-4 w-4 text-blue-500" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default RuteSampah;