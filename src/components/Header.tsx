import { Link, useLocation } from "react-router-dom";
import { Recycle } from "lucide-react";

const Header = () => {
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;
  
  return (
    <header className="bg-card border-b border-border sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <Recycle className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-xl font-bold text-foreground">Layanan TPA</h1>
              <p className="text-xs text-muted-foreground">Pengumpulan Sampah Warga</p>
            </div>
          </Link>
          
          <nav className="hidden md:flex gap-6">
            <Link 
              to="/" 
              className={`font-medium hover:text-primary transition-colors ${
                isActive("/") ? "text-primary" : "text-foreground"
              }`}
            >
              Beranda
            </Link>
            <Link 
              to="/daftar" 
              className={`font-medium hover:text-primary transition-colors ${
                isActive("/daftar") ? "text-primary" : "text-foreground"
              }`}
            >
              Daftar Jemput
            </Link>
            <Link 
              to="/jadwal" 
              className={`font-medium hover:text-primary transition-colors ${
                isActive("/jadwal") ? "text-primary" : "text-foreground"
              }`}
            >
              Jadwal
            </Link>
            <Link 
              to="/kalkulator" 
              className={`font-medium hover:text-primary transition-colors ${
                isActive("/kalkulator") ? "text-primary" : "text-foreground"
              }`}
            >
              Kalkulator
            </Link>
            <Link 
              to="/data-tpa" 
              className={`font-medium hover:text-primary transition-colors ${
                isActive("/data-tpa") ? "text-primary" : "text-foreground"
              }`}
            >
              Data TPA
            </Link>
            <Link 
              to="/anggaran-publik" 
              className={`font-medium hover:text-primary transition-colors ${
                isActive("/anggaran-publik") ? "text-primary" : "text-foreground"
              }`}
            >
              Anggaran Publik
            </Link>
            <Link
              to="/kontak" 
              className={`font-medium hover:text-primary transition-colors ${
                isActive("/kontak") ? "text-primary" : "text-foreground"
              }`}
            >
              Kontak
            </Link>
          </nav>
        </div>
        
        {/* Mobile Navigation */}
        <nav className="md:hidden flex gap-4 mt-4 overflow-x-auto pb-2">
          <Link 
            to="/" 
            className={`px-4 py-2 rounded-lg whitespace-nowrap font-medium transition-colors ${
              isActive("/") ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
            }`}
          >
            Beranda
          </Link>
          <Link 
            to="/daftar" 
            className={`px-4 py-2 rounded-lg whitespace-nowrap font-medium transition-colors ${
              isActive("/daftar") ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
            }`}
          >
            Daftar Jemput
          </Link>
          <Link 
            to="/jadwal" 
            className={`px-4 py-2 rounded-lg whitespace-nowrap font-medium transition-colors ${
              isActive("/jadwal") ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
            }`}
          >
            Jadwal
          </Link>
          <Link 
            to="/kalkulator" 
            className={`px-4 py-2 rounded-lg whitespace-nowrap font-medium transition-colors ${
              isActive("/kalkulator") ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
            }`}
          >
            Kalkulator
          </Link>
          <Link 
            to="/data-tpa" 
            className={`px-4 py-2 rounded-lg whitespace-nowrap font-medium transition-colors ${
              isActive("/data-tpa") ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
            }`}
          >
            Data TPA
          </Link>
          <Link 
            to="/anggaran-publik" 
            className={`px-4 py-2 rounded-lg whitespace-nowrap font-medium transition-colors ${
              isActive("/anggaran-publik") ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
            }`}
          >
            Anggaran Publik
          </Link>
          <Link 
            to="/kontak" 
            className={`px-4 py-2 rounded-lg whitespace-nowrap font-medium transition-colors ${
              isActive("/kontak") ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
            }`}
          >
            Kontak
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
