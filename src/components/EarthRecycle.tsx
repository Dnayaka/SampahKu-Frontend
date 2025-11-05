import { Recycle } from "lucide-react";
import { useEffect, useRef } from "react";
import earthImage from "@/assets/earth.png";

const EarthRecycle = () => {
  const earthRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let rotationY = 0;
    let rotationX = 5;
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    const handleMouseDown = (e: MouseEvent) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && earthRef.current) {
        const deltaX = e.clientX - previousMousePosition.x;
        const deltaY = e.clientY - previousMousePosition.y;
        
        rotationY += deltaX * 0.5;
        rotationX -= deltaY * 0.5;
        rotationX = Math.max(-30, Math.min(30, rotationX));
        
        earthRef.current.style.transform = `rotateX(${rotationX}deg) rotateY(${rotationY}deg)`;
        previousMousePosition = { x: e.clientX, y: e.clientY };
      }
    };

    const handleMouseUp = () => {
      isDragging = false;
    };

    const animate = () => {
      if (!isDragging && earthRef.current) {
        rotationY += 0.2;
        earthRef.current.style.transform = `rotateX(${rotationX}deg) rotateY(${rotationY}deg)`;
      }
      requestAnimationFrame(animate);
    };

    animate();

    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  return (
    <div className="relative w-32 h-32 md:w-40 md:h-40 mx-auto" style={{ perspective: '1000px' }}>
      {/* 3D Earth with real image */}
      <div
        ref={earthRef}
        className="absolute inset-0 rounded-full shadow-2xl animate-fade-in cursor-grab active:cursor-grabbing"
        style={{
          transformStyle: 'preserve-3d',
          transition: 'transform 0.1s ease-out',
          backgroundImage: `url(${earthImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Glossy overlay */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/30 via-transparent to-transparent opacity-50"></div>
        
        {/* Shadow */}
        <div className="absolute inset-0 rounded-full shadow-inner"></div>
      </div>
      
      {/* Floating Recycle Icon */}
      <div className="absolute -bottom-2 -right-2 w-16 h-16 md:w-20 md:h-20 bg-primary rounded-full shadow-lg flex items-center justify-center animate-fade-in border-4 border-background hover:scale-110 transition-transform z-10">
        <Recycle className="w-8 h-8 md:w-10 md:h-10 text-primary-foreground" strokeWidth={2.5} />
      </div>
      
      {/* Subtle glow effect */}
      <div className="absolute inset-0 rounded-full bg-primary/10 blur-xl -z-10"></div>
    </div>
  );
};

export default EarthRecycle;
