import { useState } from "react";
import { Calculator, Package, FileText, Wine, Beer } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";

const Kalkulator = () => {
  const [weights, setWeights] = useState({
    kardus: "",
    kertas: "",
    botol: "",
    kaleng: "",
  });

  const prices = {
    kardus: 1500, // Rp per kg
    kertas: 1200,
    botol: 2000,
    kaleng: 3000,
  };

  const handleInputChange = (type: keyof typeof weights, value: string) => {
    // Only allow numbers and decimals
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setWeights({ ...weights, [type]: value });
    }
  };

  const calculateTotal = () => {
    const totalWeight =
      (parseFloat(weights.kardus) || 0) +
      (parseFloat(weights.kertas) || 0) +
      (parseFloat(weights.botol) || 0) +
      (parseFloat(weights.kaleng) || 0);

    const totalPrice =
      (parseFloat(weights.kardus) || 0) * prices.kardus +
      (parseFloat(weights.kertas) || 0) * prices.kertas +
      (parseFloat(weights.botol) || 0) * prices.botol +
      (parseFloat(weights.kaleng) || 0) * prices.kaleng;

    return { totalWeight, totalPrice };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { totalWeight, totalPrice } = calculateTotal();

    if (totalWeight === 0) {
      toast({
        title: "Perhatian",
        description: "Silakan masukkan berat sampah terlebih dahulu",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Perhitungan Berhasil",
      description: `Total: ${totalWeight.toFixed(2)} kg = Rp ${totalPrice.toLocaleString("id-ID")}`,
    });
  };

  const handleReset = () => {
    setWeights({
      kardus: "",
      kertas: "",
      botol: "",
      kaleng: "",
    });
  };

  const { totalWeight, totalPrice } = calculateTotal();

  const items = [
    { key: "kardus", label: "Kardus", icon: Package, color: "text-amber-600" },
    { key: "kertas", label: "Kertas", icon: FileText, color: "text-blue-600" },
    { key: "botol", label: "Botol Plastik", icon: Wine, color: "text-green-600" },
    { key: "kaleng", label: "Kaleng", icon: Beer, color: "text-gray-600" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
            <Calculator className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            Kalkulator Daur Ulang
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Hitung berat dan estimasi nilai sampah daur ulang Anda
          </p>
        </div>

        <Card className="animate-fade-in mb-6">
          <CardHeader>
            <CardTitle>Input Berat Sampah</CardTitle>
            <CardDescription>Masukkan berat dalam kilogram (kg)</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {items.map((item) => (
                  <div key={item.key} className="space-y-2">
                    <Label htmlFor={item.key} className="flex items-center gap-2">
                      <item.icon className={`w-5 h-5 ${item.color}`} />
                      {item.label}
                      <span className="text-xs text-muted-foreground ml-auto">
                        Rp {prices[item.key as keyof typeof prices].toLocaleString("id-ID")}/kg
                      </span>
                    </Label>
                    <Input
                      id={item.key}
                      type="text"
                      inputMode="decimal"
                      placeholder="0.00"
                      value={weights[item.key as keyof typeof weights]}
                      onChange={(e) =>
                        handleInputChange(item.key as keyof typeof weights, e.target.value)
                      }
                      className="text-lg"
                    />
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <Button type="submit" size="lg" className="flex-1">
                  Hitung Total
                </Button>
                <Button type="button" variant="outline" size="lg" onClick={handleReset}>
                  Reset
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {totalWeight > 0 && (
          <Card className="animate-fade-in bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle>Hasil Perhitungan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center text-lg">
                <span className="text-muted-foreground">Total Berat:</span>
                <span className="font-bold text-foreground">{totalWeight.toFixed(2)} kg</span>
              </div>
              <div className="flex justify-between items-center text-xl">
                <span className="text-muted-foreground">Estimasi Nilai:</span>
                <span className="font-bold text-primary">
                  Rp {totalPrice.toLocaleString("id-ID")}
                </span>
              </div>
              <p className="text-sm text-muted-foreground pt-4 border-t">
                * Harga dapat berubah sewaktu-waktu. Hubungi petugas untuk informasi harga terkini.
              </p>
            </CardContent>
          </Card>
        )}

        <div className="mt-8 p-6 bg-muted/50 rounded-lg animate-fade-in">
          <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <Calculator className="w-5 h-5 text-primary" />
            Informasi Penting
          </h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Sampah harus dalam keadaan bersih dan kering</li>
            <li>• Harga di atas adalah estimasi dan dapat berubah</li>
            <li>• Minimal pengambilan 5 kg untuk mendapat layanan jemput gratis</li>
            <li>• Hubungi petugas untuk konfirmasi harga sebelum menyerahkan sampah</li>
          </ul>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Kalkulator;
