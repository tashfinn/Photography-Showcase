"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Trash2, Upload, Plus, Edit2, Check, X, Search, Filter, GripVertical, GripHorizontal, Star, Loader2 } from "lucide-react";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, rectSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion, AnimatePresence } from "framer-motion";
import imageCompression from 'browser-image-compression';

function SortableCategory({ c, editingCatId, editCatName, setEditCatName, handleUpdateCategory, setEditingCatId, handleDeleteCategory }: any) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: c._id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div ref={setNodeRef} style={style} className="flex flex-col bg-black/20 px-4 py-3 rounded-lg border border-white/5 gap-2 relative pl-10 group">
      <div 
        {...attributes} 
        {...listeners} 
        className="absolute left-3 top-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing text-white/20 group-hover:text-white/50 touch-none outline-none"
      >
        <GripVertical className="w-5 h-5" />
      </div>

      {editingCatId === c._id ? (
        <div className="flex gap-2 items-center z-10">
          <input 
            type="text" 
            value={editCatName} 
            onChange={e => setEditCatName(e.target.value)}
            className="flex-1 bg-black/40 border border-brand-200 rounded px-2 py-1 text-sm text-white"
          />
          <button onClick={() => handleUpdateCategory(c._id, { name: editCatName })} className="text-green-400 hover:text-green-300"><Check className="w-4 h-4"/></button>
          <button onClick={() => setEditingCatId(null)} className="text-red-400 hover:text-red-300"><X className="w-4 h-4"/></button>
        </div>
      ) : (
        <div className="flex justify-between items-center z-10">
          <span className="text-sm font-medium text-white">{c.name}</span>
          <div className="flex items-center gap-3">
            <button onClick={() => { setEditingCatId(c._id); setEditCatName(c.name); }} className="text-white/50 hover:text-brand-200">
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => handleDeleteCategory(c._id)} className="text-red-400/50 hover:text-red-400">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function SortablePhoto({ p, categories, isDragEnabled, editingPhotoId, editPhotoTitle, setEditPhotoTitle, editPhotoCategory, setEditPhotoCategory, handleUpdatePhoto, setEditingPhotoId, handleDeletePhoto, deletingPhotoId, updatingPhotoId }: any) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: p._id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  const isDeleting = deletingPhotoId === p._id;
  const isUpdating = updatingPhotoId === p._id;

  return (
    <div ref={setNodeRef} style={style} className={`flex flex-col rounded-xl overflow-hidden relative group h-full ${isDeleting ? 'opacity-50 pointer-events-none' : ''}`}>
      {/* The pure image dictates the exact layout height just like the main site */}
      <img src={p.imageUrl} alt={p.title} className="w-full h-auto" />
      
      {/* Absolute overlay ensures UI elements do not affect the CSS Columns balancing math */}
      <div className="absolute inset-0 bg-black/60 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity flex flex-col justify-between p-4 z-10">
        <div className="flex justify-between items-start">
          {isDragEnabled ? (
            <div 
              {...attributes} 
              {...listeners} 
              className="p-2 bg-black/50 rounded cursor-grab active:cursor-grabbing text-white/50 hover:text-white backdrop-blur-md touch-none outline-none"
            >
              <GripHorizontal className="w-5 h-5" />
            </div>
          ) : <div />}
          <div className="flex gap-2">
            <button 
              onClick={() => handleUpdatePhoto(p._id, { isFeatured: !p.isFeatured })}
              disabled={isUpdating}
              className={`p-2 bg-black/50 rounded backdrop-blur-md transition-colors ${p.isFeatured ? 'text-yellow-400' : 'text-white/50 hover:text-yellow-200'} disabled:opacity-50`}
              title={p.isFeatured ? "Remove from Featured" : "Add to Featured Works"}
            >
              {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Star className="w-4 h-4" fill={p.isFeatured ? "currentColor" : "none"} />}
            </button>
            <button 
              onClick={() => {
                setEditingPhotoId(p._id);
                setEditPhotoTitle(p.title);
                setEditPhotoCategory(p.category?._id || "");
              }}
              className="p-2 bg-black/50 rounded text-white/50 hover:text-brand-200 backdrop-blur-md"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button 
              onClick={() => handleDeletePhoto(p._id)}
              disabled={isDeleting || isUpdating}
              className="p-2 bg-black/50 rounded text-red-400/50 hover:text-red-400 backdrop-blur-md disabled:opacity-50"
            >
              {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div>
          {editingPhotoId === p._id ? (
            <div className="space-y-2 bg-black/90 p-3 rounded-lg backdrop-blur-xl border border-white/10">
              <input 
                type="text" 
                value={editPhotoTitle} 
                onChange={e => setEditPhotoTitle(e.target.value)}
                className="w-full bg-white/10 rounded px-3 py-1.5 text-sm text-white focus:outline-none focus:border-brand-200 border border-transparent"
              />
              <select
                value={editPhotoCategory}
                onChange={e => setEditPhotoCategory(e.target.value)}
                className="w-full bg-white/10 rounded px-3 py-1.5 text-sm text-white focus:outline-none focus:border-brand-200 border border-transparent"
              >
                <option value="" className="bg-[#111] text-white">Select Category</option>
                {categories.map((c: any) => <option key={c._id} value={c._id} className="bg-[#111] text-white">{c.name}</option>)}
              </select>
              <div className="flex gap-2">
                <button 
                  onClick={() => handleUpdatePhoto(p._id, { title: editPhotoTitle, category: editPhotoCategory })} 
                  disabled={isUpdating}
                  className="flex-1 flex items-center justify-center bg-green-500/20 text-green-400 py-1.5 rounded text-sm font-medium hover:bg-green-500/30 disabled:opacity-50"
                >
                  {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
                </button>
                <button 
                  onClick={() => setEditingPhotoId(null)} 
                  disabled={isUpdating}
                  className="flex-1 bg-white/5 text-white/50 py-1.5 rounded text-sm font-medium hover:bg-white/10 disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-black/40 backdrop-blur-md p-3 rounded-lg border border-white/5">
              <p className="text-xs text-brand-200 uppercase tracking-widest mb-1">{p.category?.name}</p>
              <p className="font-bold text-white text-lg">{p.title}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ModeratorDashboard() {
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);
  const [photos, setPhotos] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [newCatName, setNewCatName] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadCategory, setUploadCategory] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("");

  // Edit States
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editCatName, setEditCatName] = useState("");

  const [editingPhotoId, setEditingPhotoId] = useState<string | null>(null);
  const [editPhotoTitle, setEditPhotoTitle] = useState("");
  const [editPhotoCategory, setEditPhotoCategory] = useState("");
  const [deletingPhotoId, setDeletingPhotoId] = useState<string | null>(null);
  const [updatingPhotoId, setUpdatingPhotoId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    const [catRes, photRes] = await Promise.all([
      fetch("/api/categories", { cache: "no-store" }),
      fetch("/api/photos", { cache: "no-store" }),
    ]);
    if (catRes.ok) setCategories(await catRes.json());
    if (photRes.ok) setPhotos(await photRes.json());
    setIsLoading(false);
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/moderator/login");
  };

  // --- CATEGORIES ---
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName) return;
    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newCatName, order: categories.length + 1 }),
    });
    if (res.ok) {
      setNewCatName("");
      fetchData();
    } else {
      alert("Failed to create category");
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm("Are you sure? This will fail if photos exist in this category.")) return;
    const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
    if (res.ok) fetchData();
    else alert("Cannot delete category containing photos.");
  };

  const handleUpdateCategory = async (id: string, payload: any) => {
    await fetch(`/api/categories/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setEditingCatId(null);
    fetchData();
  };

  const handleDragEndCategories = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setCategories((items) => {
        const oldIndex = items.findIndex(i => i._id === active.id);
        const newIndex = items.findIndex(i => i._id === over.id);
        const newItems = arrayMove(items, oldIndex, newIndex);
        
        // Optimistically update DB
        const updates = newItems.map((item, idx) => ({ _id: item._id, order: idx + 1 }));
        fetch('/api/categories/reorder', { method: 'PUT', headers: { "Content-Type": "application/json" }, body: JSON.stringify(updates) });
        
        // Optimistically update local order field
        return newItems.map((item, idx) => ({ ...item, order: idx + 1 }));
      });
    }
  };

  // --- PHOTOS ---
  const handleUploadPhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile || !uploadTitle || !uploadCategory) return;

    setIsUploading(true);
    
    try {
      const options = {
        maxSizeMB: 2,
        maxWidthOrHeight: 2560,
        useWebWorker: true,
      };
      const compressedFile = await imageCompression(uploadFile, options);

      const formData = new FormData();
      formData.append("file", compressedFile);
      formData.append("title", uploadTitle);
      formData.append("category", uploadCategory);

      const res = await fetch("/api/photos", {
        method: "POST",
        body: formData,
      });

      setIsUploading(false);
      if (res.ok) {
        setUploadFile(null);
        setUploadTitle("");
        fetchData();
      } else {
        alert("Failed to upload photo");
      }
    } catch (error) {
      console.error(error);
      alert("Error compressing or uploading photo");
      setIsUploading(false);
    }
  };

  const handleDeletePhoto = async (id: string) => {
    if (!confirm("Delete this photo?")) return;
    setDeletingPhotoId(id);
    const res = await fetch(`/api/photos/${id}`, { method: "DELETE" });
    if (res.ok) await fetchData();
    setDeletingPhotoId(null);
  };

  const handleUpdatePhoto = async (id: string, payload: any) => {
    setUpdatingPhotoId(id);
    await fetch(`/api/photos/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setEditingPhotoId(null);
    await fetchData();
    setUpdatingPhotoId(null);
  };

  const handleDragEndPhotos = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setPhotos((items) => {
        const oldIndex = items.findIndex(i => i._id === active.id);
        const newIndex = items.findIndex(i => i._id === over.id);
        const newItems = arrayMove(items, oldIndex, newIndex);
        
        // Optimistically update DB
        const updates = newItems.map((item, idx) => ({ _id: item._id, order: idx + 1 }));
        fetch('/api/photos/reorder', { method: 'PUT', headers: { "Content-Type": "application/json" }, body: JSON.stringify(updates) });
        
        // Optimistically update local order field
        return newItems.map((item, idx) => ({ ...item, order: idx + 1 }));
      });
    }
  };

  // Filtered Photos
  const filteredPhotos = photos.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesCat = true;
    if (filterCategory === "featured") {
      matchesCat = p.isFeatured === true;
    } else if (filterCategory) {
      matchesCat = p.category?._id === filterCategory;
    }
    
    return matchesSearch && matchesCat;
  });

  const isPhotoDragEnabled = !searchQuery;

  return (
    <div className="container mx-auto px-6 py-12 max-w-[1600px]">
      <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-4">
        <h1 className="text-3xl font-bold tracking-widest uppercase text-white">Manage Gallery</h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        
        {/* Left Column: Categories & Upload */}
        <div className="w-full lg:w-80 flex flex-col gap-8 flex-shrink-0">
          <div className="glass p-6 rounded-2xl border border-white/10">
            <h2 className="text-xl font-bold mb-6 text-white">Categories</h2>
            <form onSubmit={handleAddCategory} className="flex gap-2 mb-6">
              <input
                type="text"
                placeholder="New Category"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                className="flex-1 bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-200"
              />
              <button type="submit" className="bg-white text-dark-100 p-2 rounded-lg hover:bg-brand-200 transition-colors">
                <Plus className="w-5 h-5" />
              </button>
            </form>
            
            <div className="space-y-3">
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEndCategories}>
                <SortableContext items={categories.map(c => c._id)} strategy={verticalListSortingStrategy}>
                  {categories.map((c) => (
                    <SortableCategory 
                      key={c._id} 
                      c={c} 
                      editingCatId={editingCatId}
                      editCatName={editCatName}
                      setEditCatName={setEditCatName}
                      handleUpdateCategory={handleUpdateCategory}
                      setEditingCatId={setEditingCatId}
                      handleDeleteCategory={handleDeleteCategory}
                    />
                  ))}
                </SortableContext>
              </DndContext>
              {categories.length === 0 && <p className="text-white/50 text-sm">No categories yet.</p>}
            </div>
          </div>

          {/* Upload Section */}
          <div className="glass p-6 rounded-2xl border border-white/10">
            <h2 className="text-xl font-bold mb-6 text-white">Upload Photo</h2>
            <form onSubmit={handleUploadPhoto} className="flex flex-col gap-4">
              <div className="space-y-1">
                <label className="text-xs text-white/50 uppercase">Title</label>
                <input
                  type="text"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:border-brand-200"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-white/50 uppercase">Category</label>
                <select
                  value={uploadCategory}
                  onChange={(e) => setUploadCategory(e.target.value)}
                  className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:border-brand-200"
                >
                  <option value="" className="bg-[#111] text-white">Select Category</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id} className="bg-[#111] text-white">{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-white/50 uppercase">Image File</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  className="w-full bg-black/20 border border-white/10 rounded-lg px-2 py-2 text-sm text-white file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-white file:text-dark-100 hover:file:bg-brand-200"
                />
              </div>
              <button
                type="submit"
                disabled={isUploading || !uploadFile || !uploadTitle || !uploadCategory}
                className="bg-brand-200 text-dark-100 px-6 py-2.5 rounded-lg font-bold uppercase tracking-wider hover:bg-brand-300 transition-colors disabled:opacity-50 mt-2"
              >
                {isUploading ? "..." : "Upload"}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Manage Photos */}
        <div className="flex-1 w-full space-y-8">
          <div className="glass p-6 md:p-8 rounded-2xl border border-white/10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
              <div>
                <h2 className="text-2xl font-bold text-white">Manage Photos</h2>
                {isPhotoDragEnabled && <p className="text-sm text-brand-200 mt-1">Drag and drop photos to rearrange them on the live website.</p>}
                {!isPhotoDragEnabled && <p className="text-sm text-white/50 mt-1">Clear filters to enable drag-and-drop ordering.</p>}
              </div>
              
              <div className="flex gap-4 w-full md:w-auto">
                <div className="relative flex-1 md:w-56">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                  <input 
                    type="text" 
                    placeholder="Search titles..." 
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full bg-black/20 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:border-brand-200"
                  />
                </div>
                <div className="relative flex-1 md:w-56">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                  <select 
                    value={filterCategory}
                    onChange={e => setFilterCategory(e.target.value)}
                    className="w-full bg-black/20 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:border-brand-200 appearance-none"
                  >
                    <option value="" className="bg-[#111] text-white">All Categories</option>
                    <option value="featured" className="bg-[#111] text-brand-200 font-bold">★ Featured Works</option>
                    {categories.map(c => <option key={c._id} value={c._id} className="bg-[#111] text-white">{c.name}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEndPhotos}>
              <SortableContext items={filteredPhotos.map(p => p._id)} strategy={rectSortingStrategy}>
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center py-24 w-full">
                    <Loader2 className="w-10 h-10 animate-spin text-brand-200 mb-4" />
                    <p className="text-white/50 text-sm">Loading your photos...</p>
                  </div>
                ) : (
                  <>
                    <div className="columns-1 md:columns-2 lg:columns-3 gap-8">
                      <AnimatePresence mode="popLayout">
                        {filteredPhotos.map((p) => (
                          <motion.div
                            key={p._id}
                            layout
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.5 }}
                            transition={{ duration: 0.3 }}
                            className="break-inside-avoid mb-8"
                          >
                            <SortablePhoto 
                              p={p} 
                              categories={categories}
                              isDragEnabled={isPhotoDragEnabled}
                              editingPhotoId={editingPhotoId}
                              editPhotoTitle={editPhotoTitle}
                              setEditPhotoTitle={setEditPhotoTitle}
                              editPhotoCategory={editPhotoCategory}
                              setEditPhotoCategory={setEditPhotoCategory}
                              handleUpdatePhoto={handleUpdatePhoto}
                              setEditingPhotoId={setEditingPhotoId}
                              handleDeletePhoto={handleDeletePhoto}
                              deletingPhotoId={deletingPhotoId}
                            />
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                    {filteredPhotos.length === 0 && <p className="text-white/50 text-sm py-8 text-center w-full">No photos found matching your criteria.</p>}
                  </>
                )}
              </SortableContext>
            </DndContext>
          </div>
        </div>

      </div>
    </div>
  );
}
