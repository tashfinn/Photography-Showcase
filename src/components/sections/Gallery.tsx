"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const GalleryCard = ({ photo, openLightbox }: { photo: any, openLightbox: (p: any) => void }) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });
  
  const { scrollY } = useScroll();

  const rawRotateX = useTransform(scrollYProgress, [0, 0.5, 1], [15, 0, -15]);
  const rawScale = useTransform(scrollYProgress, [0, 0.5, 1], [0.9, 1, 0.9]);

  // Fade out the 3D effect when the user is at the absolute top of the page
  const rotateX = useTransform(() => {
    const factor = Math.min(scrollY.get() / 150, 1);
    return rawRotateX.get() * factor;
  });

  const scale = useTransform(() => {
    const factor = Math.min(scrollY.get() / 150, 1);
    return 1 + (rawScale.get() - 1) * factor;
  });

  return (
    <motion.div
      ref={ref}
      style={{ perspective: 1000 }}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      onClick={() => openLightbox(photo)}
      className="break-inside-avoid mb-16 pb-16 border-b border-white/15 relative rounded-xl group cursor-pointer bg-transparent"
    >
      <motion.div 
        style={{ rotateX, scale }}
        className="relative w-full h-full overflow-hidden rounded-xl shadow-2xl transition-shadow duration-700 ease-out group-hover:shadow-[0_0_40px_rgba(255,94,58,0.3)] z-10"
      >
        <motion.img
          layoutId={`photo-${photo._id}`}
          src={photo.imageUrl}
          alt={photo.title}
          className="w-full h-auto opacity-80 group-hover:opacity-100 transition-all duration-700 ease-out filter group-hover:contrast-125 group-hover:scale-105"
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-6 pointer-events-none">
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            whileHover={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="w-full"
          >
            <p className="text-brand-200 text-xs font-mono tracking-widest uppercase mb-1 drop-shadow-md">
              {photo.category?.name}
            </p>
            <h3 className="text-white text-xl font-medium tracking-wide drop-shadow-lg">
              {photo.title}
            </h3>
          </motion.div>
        </div>
      </motion.div>
      
      {/* Intense Bloom Effect Background layer */}
      <div className="absolute inset-0 bg-brand-200/20 blur-[50px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 -z-10 rounded-full scale-90" />
    </motion.div>
  );
};

export default function Gallery({ photos }: { photos: any[] }) {
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get("category");
  const [selectedPhoto, setSelectedPhoto] = useState<any | null>(null);

  const openLightbox = (photo: any) => {
    setSelectedPhoto(photo);
  };

  const closeLightbox = () => {
    setSelectedPhoto(null);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (selectedPhoto) {
      document.body.style.overflow = 'hidden';
      if ((window as any).lenis) (window as any).lenis.stop();
    } else {
      document.body.style.overflow = '';
      if ((window as any).lenis) (window as any).lenis.start();
    }
    return () => { 
      document.body.style.overflow = ''; 
      if ((window as any).lenis) (window as any).lenis.start();
    };
  }, [selectedPhoto]);

  const isMounted = useRef(false);

  useEffect(() => {
    if (isMounted.current) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      isMounted.current = true;
    }
  }, [currentCategory]);

  const displayedPhotos = currentCategory 
    ? photos.filter(p => p.category?.slug === currentCategory)
    : photos;

  return (
    <div className="w-full relative">
      <AnimatePresence mode="wait">
        <motion.div 
          key={currentCategory || "all"}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className="columns-1 md:columns-2 lg:columns-3 gap-32 pb-32 [column-rule:1px_solid_rgba(255,255,255,0.15)]"
        >
          {displayedPhotos.map((photo) => (
            <GalleryCard key={photo._id} photo={photo} openLightbox={openLightbox} />
          ))}
        </motion.div>
      </AnimatePresence>

      {displayedPhotos.length === 0 && (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          className="h-[50vh] flex items-center justify-center text-white/50 tracking-widest uppercase w-full"
        >
          No photos found for this category.
        </motion.div>
      )}

      {/* Lightbox Overlay */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            onClick={closeLightbox}
            className="fixed inset-0 z-[99999] flex items-center justify-center p-4 md:p-12 cursor-zoom-out overflow-hidden"
          >
            {/* Immersive Background */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <img 
                src="/assets/Background.png" 
                alt="Background" 
                className="absolute inset-0 w-full h-full object-cover blur-[30px] scale-110 opacity-100" 
              />
              <div className="absolute inset-0 bg-black/30" />
            </div>

            <button 
              onClick={(e) => { e.stopPropagation(); closeLightbox(); }}
              className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors backdrop-blur-md z-50 cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>

            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ duration: 0.5, type: "spring", bounce: 0.2 }}
              className="relative w-full h-full flex flex-col items-center justify-center"
            >
              {/* Dynamic Reflection Shadows & Glass Effects */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                
                {/* Left Side Ambient Glass Glow (Generic, not photo) */}
                <div className="absolute w-[50vh] h-[70vh] rounded-full bg-gradient-to-tr from-white/5 to-brand-200/10 blur-[90px] -translate-x-[20vw]" />
                
                {/* Massive soft ambient glow (Right Side Photo Reflection) */}
                <img
                  src={selectedPhoto.imageUrl}
                  alt=""
                  className="absolute max-w-[90vw] max-h-[85vh] object-contain blur-[120px] opacity-70 scale-110 saturate-150 translate-x-[8vw]"
                />
                {/* Tighter, brighter glass reflection (Right Side Photo Reflection) */}
                <img
                  src={selectedPhoto.imageUrl}
                  alt=""
                  className="absolute max-w-[90vw] max-h-[85vh] object-contain blur-[50px] opacity-90 scale-105 saturate-200 translate-x-[4vw]"
                />
              </div>

              <motion.img
                layoutId={`photo-${selectedPhoto._id}`}
                src={selectedPhoto.imageUrl}
                alt={selectedPhoto.title}
                className="relative z-10 max-w-full max-h-[85vh] object-contain rounded-lg shadow-[0_20px_60px_rgba(0,0,0,0.8)]"
              />
              <div className="mt-8 text-center relative z-20">
                <p className="text-brand-200 text-sm font-mono tracking-widest uppercase mb-2 drop-shadow-md">
                  {selectedPhoto.category?.name}
                </p>
                <h3 className="text-white text-3xl font-light tracking-wide drop-shadow-xl">
                  {selectedPhoto.title}
                </h3>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
