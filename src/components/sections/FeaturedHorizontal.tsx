"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform, AnimatePresence, useInView, Variants } from "framer-motion";
import { X } from "lucide-react";

const charVariants: Variants = {
  hidden: { opacity: 0, y: 50, rotateX: -90 },
  show: { opacity: 1, y: 0, rotateX: 0, transition: { type: "spring", stiffness: 70, damping: 12 } }
};

export default function FeaturedHorizontal({ photos }: { photos: any[] }) {
  const targetRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLHeadingElement>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<any | null>(null);
  
  const isInView = useInView(textRef, { once: true, amount: 0.1 });

  // Lazy evaluate the delay ONCE per mount. 
  // If performance.now() is small, it's a hard page load/reload and the Preloader is running.
  // The Preloader starts fading at ~1.7s, so 1.8s delay perfectly synchronizes the text reveal.
  const [delay] = useState(() => {
    if (typeof window !== 'undefined' && performance.now() < 3500) {
      return 1.8;
    }
    return 0;
  });

  const { scrollYProgress } = useScroll({
    target: targetRef,
  });

  const textContainerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: delay }
    }
  };

  // Map the horizontal scroll across the entire section height so there is no dead zone at the end
  const x = useTransform(scrollYProgress, [0, 1], ["calc(0% - 0vw)", "calc(-100% + 45vw)"]); 

  // Only show explicitly featured photos (no fallback, so the admin has full control)
  const featured = photos.filter(p => p.isFeatured);

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


  if (!featured || featured.length === 0) return null;

  return (
    <>
      {/* DESKTOP VIEW: Horizontal Scrolling */}
      <section ref={targetRef} className="hidden md:block relative h-[300vh] bg-transparent">
        <div className="sticky top-0 h-screen flex items-center overflow-hidden">
          
          {/* Title Block - Pushing deeper into the right so sliding photos disappear correctly */}
          <div className="pl-6 md:pl-12 shrink-0 pr-16 md:pr-32 z-0 relative h-full flex flex-col justify-center">
            <motion.h2 
              ref={textRef}
              variants={textContainerVariants}
              initial="hidden"
              animate={isInView ? "show" : "hidden"}
              style={{ perspective: 1000 }}
              className="text-5xl md:text-[7vw] lg:text-[6vw] xl:text-[5vw] font-black uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-[#FFE8A1] to-[#E89D42] drop-shadow-[0_10px_30px_rgba(0,0,0,0.4)] leading-[0.85] flex flex-col items-start"
            >
              <div className="flex overflow-hidden">
                {"FEATURED".split("").map((char, index) => (
                  <motion.span key={`f-${index}`} variants={charVariants} className="inline-block">
                    {char}
                  </motion.span>
                ))}
              </div>
              <div className="flex overflow-hidden mt-1 md:mt-2">
                {"WORKS".split("").map((char, index) => (
                  <motion.span key={`w-${index}`} variants={charVariants} className="inline-block">
                    {char}
                  </motion.span>
                ))}
              </div>
            </motion.h2>
          </div>
          
          {/* Horizontal Sliding Track */}
          <motion.div style={{ x }} className="flex gap-16 md:gap-32 px-8 relative z-10 pr-[10vw]">
            {featured.map((photo, index) => (
              <motion.div 
                key={photo._id} 
                initial={{ opacity: 0, scale: 0.85, x: 100 }}
                animate={isInView ? { opacity: 1, scale: 1, x: 0 } : { opacity: 0, scale: 0.85, x: 100 }}
                transition={{ 
                  duration: 0.9, 
                  delay: delay + 0.6 + (index * 0.1), 
                  ease: [0.21, 0.47, 0.32, 0.98] 
                }}
                className="relative w-[75vw] md:w-[45vw] lg:w-[35vw] h-[50vh] md:h-[65vh] shrink-0 p-3 rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-sm transition-all duration-700 ease-out group hover:border-brand-200/50 hover:bg-white/10 shadow-2xl cursor-pointer"
                onClick={() => openLightbox(photo)}
              >
                <div className="relative w-full h-full overflow-hidden rounded-2xl">
                  <motion.img 
                    layoutId={`photo-${photo._id}-featured`}
                    src={photo.imageUrl} 
                    alt={photo.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-out filter group-hover:contrast-125" 
                  />
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex items-end p-8 md:p-12 opacity-80 group-hover:opacity-100 transition-opacity duration-500">
                    <motion.div 
                      initial={{ y: 20, opacity: 0 }}
                      whileInView={{ y: 0, opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: 0.2 }}
                    >
                      <p className="text-brand-200 text-xs md:text-sm font-mono tracking-widest uppercase mb-3 drop-shadow-md">
                        {photo.category?.name}
                      </p>
                      <h3 className="text-white text-2xl md:text-4xl font-light drop-shadow-lg tracking-wide">
                        {photo.title}
                      </h3>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* MOBILE VIEW: Vertical Scrolling */}
      <section className="block md:hidden relative bg-transparent pt-24 pb-12 px-6 w-full overflow-x-hidden">
        <div className="mb-12 w-full">
          <motion.h2 
            variants={textContainerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            style={{ perspective: 1000 }}
            className="text-[9.5vw] font-black uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-[#FFE8A1] to-[#E89D42] drop-shadow-[0_10px_30px_rgba(0,0,0,0.4)] leading-[0.85] flex flex-col items-start w-full"
          >
            <div className="flex overflow-hidden">
              {"FEATURED".split("").map((char, index) => (
                <motion.span key={`fm-${index}`} variants={charVariants} className="inline-block">
                  {char}
                </motion.span>
              ))}
            </div>
            <div className="flex overflow-hidden mt-1">
              {"WORKS".split("").map((char, index) => (
                <motion.span key={`wm-${index}`} variants={charVariants} className="inline-block">
                  {char}
                </motion.span>
              ))}
            </div>
          </motion.h2>
          <div className="flex items-center gap-4 mt-6">
            <div className="h-px w-8 bg-brand-200" />
            <p className="text-brand-200 tracking-widest uppercase text-xs">Selected</p>
          </div>
        </div>

        <div className="flex flex-col gap-24">
          {featured.map((photo) => (
            <motion.div 
              key={`mobile-${photo._id}`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6 }}
              className="relative w-full h-[60vh] p-3 rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-sm transition-all duration-700 ease-out group hover:border-brand-200/50 hover:bg-white/10 shadow-2xl cursor-pointer"
              onClick={() => openLightbox(photo)}
            >
              <div className="relative w-full h-full overflow-hidden rounded-2xl">
                <motion.img 
                  layoutId={`photo-${photo._id}-featured-mobile`}
                  src={photo.imageUrl} 
                  alt={photo.title}
                  className="w-full h-full object-cover filter contrast-110 group-hover:scale-105 transition-transform duration-700 ease-out" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex items-end p-6">
                  <div>
                    <p className="text-brand-200 text-xs font-mono tracking-widest uppercase mb-2 drop-shadow-md">
                      {photo.category?.name}
                    </p>
                    <h3 className="text-white text-xl font-medium drop-shadow-lg tracking-wide">
                      {photo.title}
                    </h3>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

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
                layoutId={`photo-${selectedPhoto._id}-featured`}
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
    </>
  );
}
