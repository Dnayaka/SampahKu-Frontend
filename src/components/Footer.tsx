import { MapPin, Phone, Mail } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
          <div className="flex flex-col items-center md:items-start gap-2">
            <div className="flex items-center gap-2 text-primary">
              <MapPin className="w-5 h-5" />
              <h3 className="font-semibold">Alamat</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Jl. TPA Daerah No. 123<br />
              Kelurahan Bersih, Kota Sejahtera
            </p>
          </div>
          
          <div className="flex flex-col items-center md:items-start gap-2">
            <div className="flex items-center gap-2 text-primary">
              <Phone className="w-5 h-5" />
              <h3 className="font-semibold">Hotline</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              0800-123-4567<br />
              Senin - Sabtu: 07:00 - 17:00
            </p>
          </div>
          
          <div className="flex flex-col items-center md:items-start gap-2">
            <div className="flex items-center gap-2 text-primary">
              <Mail className="w-5 h-5" />
              <h3 className="font-semibold">Email</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Support@SampahKu.id
            </p>
          </div>
        </div>
        
        <div className="mt-8 pt-6 border-t border-border text-center">
          <p className="text-sm text-muted-foreground">
            © 2025 Layanan TPA Daerah. Bersih Desaku, Untung Wargaku.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
