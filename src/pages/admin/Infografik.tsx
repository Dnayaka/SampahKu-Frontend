import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
} from "recharts";

const categoryData = [
  { name: "Rumah Tangga", value: 450 },
  { name: "Organik", value: 320 },
  { name: "Anorganik", value: 285 },
  { name: "Elektronik", value: 150 },
];

const yearlyData = [
  { tahun: "2021", total: 850 },
  { tahun: "2022", total: 1050 },
  { tahun: "2023", total: 1200 },
  { tahun: "2024", total: 1450 },
  { tahun: "2025", total: 1205 },
];

const organicVsInorganic = [
  { name: "Organik", value: 620, fill: "#22c55e" },
  { name: "Anorganik", value: 585, fill: "#3b82f6" },
];

const COLORS = ["#22c55e", "#3b82f6", "#f59e0b", "#ef4444"];

const Infografik = () => {
  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Total Sampah per Kategori */}
        <Card>
          <CardHeader>
            <CardTitle>Total Sampah per Kategori (kg)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#22c55e" name="Berat (kg)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Total Sampah per Tahun */}
          <Card>
            <CardHeader>
              <CardTitle>Total Sampah per Tahun (kg)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={yearlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="tahun" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="total" fill="#3b82f6" name="Total (kg)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Perbandingan Organik vs Anorganik */}
          <Card>
            <CardHeader>
              <CardTitle>Organik vs Anorganik</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={organicVsInorganic}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    dataKey="value"
                  >
                    {organicVsInorganic.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Distribusi Kategori */}
        <Card>
          <CardHeader>
            <CardTitle>Distribusi Kategori Sampah</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default Infografik;
