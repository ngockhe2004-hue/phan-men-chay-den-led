import React, { useState, useEffect, useRef } from 'react';
import { 
  Film, 
  Upload, 
  Image as ImageIcon, 
  Type, 
  Clock, 
  Trash2, 
  Eye, 
  Search, 
  Plus, 
  Check, 
  X, 
  Tag, 
  Download, 
  Play,
  FolderOpen,
  FileVideo,
  FileImage,
  Sparkles
} from 'lucide-react';
import { MediaItem, MediaType } from '../types';
import { storageService } from '../services/storage';

export const MediaLibraryView: React.FC = () => {
  const [mediaList, setMediaList] = useState<MediaItem[]>(storageService.getMedia());
  const [filterType, setFilterType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewItem, setPreviewItem] = useState<MediaItem | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  // New Media Form state
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<MediaType>('video');
  const [newUrl, setNewUrl] = useState('');
  const [newThumb, setNewThumb] = useState('');
  const [newDuration, setNewDuration] = useState(30);

  // Direct Local File Picker states
  const fileInputRef = useRef<HTMLInputElement>(null);
  const thumbInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const update = () => setMediaList(storageService.getMedia());
    return storageService.subscribe(update);
  }, []);

  const filteredMedia = mediaList.filter(m => {
    const matchSearch = m.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchType = filterType === 'ALL' || m.type === filterType;
    return matchSearch && matchType;
  });

  const handleDelete = (id: string, title: string) => {
    if (confirm(`Bạn có chắc muốn xóa tệp "${title}" khỏi thư viện?`)) {
      storageService.deleteMedia(id);
    }
  };

  const handleFileProcess = (file: File) => {
    setSelectedFile(file);

    // Tự động điền tiêu đề từ tên file (bỏ đuôi mở rộng)
    const baseName = file.name.replace(/\.[^/.]+$/, '');
    if (!newTitle.trim()) {
      setNewTitle(baseName);
    }

    // Tự động nhận diện loại video hoặc ảnh
    if (file.type.startsWith('video/')) {
      setNewType('video');
      const fileUrl = URL.createObjectURL(file);
      setNewUrl(fileUrl);
      // Thử đọc thời lượng thực tế của file video
      const videoEl = document.createElement('video');
      videoEl.preload = 'metadata';
      videoEl.src = fileUrl;
      videoEl.onloadedmetadata = () => {
        if (videoEl.duration && !isNaN(videoEl.duration)) {
          setNewDuration(Math.round(videoEl.duration));
        }
      };
    } else if (file.type.startsWith('image/')) {
      setNewType('image');
      // Đọc file ảnh dạng DataURL nén nhẹ để lưu vĩnh viễn vào localStorage không bị mất khi F5
      const reader = new FileReader();
      reader.onload = (e) => {
        const rawData = e.target?.result as string;
        if (!rawData) return;
        const img = new Image();
        img.onload = () => {
          const maxDim = 1280;
          let w = img.width;
          let h = img.height;
          if (w > maxDim || h > maxDim) {
            if (w > h) {
              h = Math.round((h * maxDim) / w);
              w = maxDim;
            } else {
              w = Math.round((w * maxDim) / h);
              h = maxDim;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, w, h);
            const compressed = canvas.toDataURL('image/jpeg', 0.85);
            setNewUrl(compressed);
            setNewThumb(compressed);
          } else {
            setNewUrl(rawData);
            setNewThumb(rawData);
          }
        };
        img.onerror = () => {
          setNewUrl(rawData);
          setNewThumb(rawData);
        };
        img.src = rawData;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileProcess(e.target.files[0]);
    }
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleThumbChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        if (base64) {
          setNewThumb(base64);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateMedia = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const defaultThumbs: Record<MediaType, string> = {
      video: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=600&q=80',
      image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=600&q=80',
      ticker: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=600&q=80',
      widget: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80',
      webpage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80'
    };

    const formattedSize = selectedFile
      ? `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB`
      : newType === 'video'
      ? '28.4 MB'
      : '3.2 MB';

    const newItem: MediaItem = {
      id: 'media-' + Date.now(),
      title: newTitle.trim(),
      type: newType,
      url: newUrl.trim() || (newType === 'video' ? 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4' : 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80'),
      thumbnail: newThumb.trim() || defaultThumbs[newType],
      duration: newType === 'video' ? Number(newDuration) : 15,
      size: formattedSize,
      resolution: newType === 'video' ? '1920x1080 (Full HD)' : '1920x1080',
      uploadedAt: new Date().toLocaleDateString('vi-VN'),
      tags: [selectedFile ? 'Tệp Gốc Từ Máy' : 'Tải Lên Mới', newType === 'video' ? 'Video HD' : 'Hình Ảnh']
    };

    storageService.addMedia(newItem);
    setIsUploadOpen(false);
    setSelectedFile(null);
    setNewTitle('');
    setNewUrl('');
    setNewThumb('');
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center space-x-2.5">
            <Film className="w-6 h-6 text-cyan-400" />
            <span>Thư Viện Đa Phương Tiện (Digital Media Library)</span>
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Quản lý tài sản số bao gồm Video chất lượng cao (H.264/H.265), Hình ảnh Poster, Chữ chạy Ticker và Widget
          </p>
        </div>

        <button
          onClick={() => setIsUploadOpen(true)}
          className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-lg shadow-cyan-600/25 transition-all flex items-center space-x-2 active:scale-95"
        >
          <Upload className="w-4 h-4" />
          <span>+ Tải Lên Media Mới</span>
        </button>
      </div>

      {/* Filter & Search */}
      <div className="glass-panel p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm theo tiêu đề video, ảnh, banner..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {['ALL', 'video', 'image', 'ticker', 'widget'].map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${
                filterType === type
                  ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/20'
                  : 'bg-slate-950/80 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {type === 'ALL' ? 'Tất cả media' : type === 'image_slider' ? 'Slide ảnh' : type}
            </button>
          ))}
        </div>
      </div>

      {/* Media Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredMedia.map(item => (
          <div
            key={item.id}
            className="rounded-2xl glass-panel bg-slate-900/70 border border-slate-800 hover:border-cyan-500/40 transition-all p-4 flex flex-col justify-between space-y-3 group shadow-lg"
          >
            <div className="space-y-3">
              {/* Media Thumbnail */}
              <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-950 border border-slate-800 group/thumb">
                <img
                  src={item.thumbnail}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover/thumb:scale-105"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=600&q=80';
                  }}
                />

                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                  <button
                    onClick={() => setPreviewItem(item)}
                    className="p-2.5 rounded-full bg-cyan-600 text-white shadow-lg shadow-cyan-600/40 hover:scale-110 transition-transform"
                    title="Xem trước media"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                </div>

                {/* Badge Type */}
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-sm text-[10px] font-bold uppercase tracking-wider text-cyan-300 flex items-center space-x-1">
                  {item.type === 'video' && <Film className="w-3 h-3" />}
                  {item.type === 'image' && <ImageIcon className="w-3 h-3" />}
                  {item.type === 'ticker' && <Type className="w-3 h-3" />}
                  {item.type === 'widget' && <Clock className="w-3 h-3" />}
                  <span>{item.type}</span>
                </div>

                {item.type === 'video' && (
                  <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/80 backdrop-blur-sm text-[10px] font-mono text-white">
                    {item.duration}s
                  </div>
                )}
              </div>

              {/* Title & tags */}
              <div>
                <h3 className="text-sm font-bold text-white line-clamp-1 group-hover:text-cyan-300 transition-colors">
                  {item.title}
                </h3>
                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                  {item.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-400 text-[10px] font-medium border border-slate-750"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Specs info */}
              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
                <span>{item.resolution}</span>
                <span>{item.size}</span>
                <span>{item.uploadedAt}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <button
                onClick={() => setPreviewItem(item)}
                className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center space-x-1"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Xem Trước</span>
              </button>

              <button
                onClick={() => handleDelete(item.id, item.title)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                title="Xóa tệp media"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Upload Media Modal */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg rounded-2xl glass-panel-glow bg-slate-900 border border-slate-700 shadow-2xl p-6 relative">
            <button
              onClick={() => setIsUploadOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Thêm Tệp Media Mới</h3>
                <p className="text-xs text-slate-400">Trỏ trực tiếp lấy file từ máy tính hoặc nhập đường dẫn URL CDN</p>
              </div>
            </div>

            <form onSubmit={handleCreateMedia} className="space-y-4">
              {/* KHU VỰC TRỎ TRỰC TIẾP ĐỂ LẤY FILE TỪ MÁY TÍNH */}
              <input
                ref={fileInputRef}
                type="file"
                accept="video/mp4,video/mkv,video/webm,video/quicktime,image/jpeg,image/png,image/webp,image/gif"
                onChange={handleFileChange}
                className="hidden"
              />
              <input
                ref={thumbInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleThumbChange}
                className="hidden"
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleFileDrop}
                className={`p-4 rounded-xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center text-center group ${
                  isDragging
                    ? 'border-cyan-400 bg-cyan-500/15 ring-2 ring-cyan-400/40'
                    : selectedFile
                    ? 'border-emerald-500/50 bg-emerald-500/10'
                    : 'border-cyan-500/30 hover:border-cyan-400 bg-slate-950/80 hover:bg-slate-950'
                }`}
              >
                {selectedFile ? (
                  <div className="flex items-center justify-between space-x-3 text-left w-full">
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                        {selectedFile.type.startsWith('video') ? <Film className="w-5 h-5" /> : <ImageIcon className="w-5 h-5" />}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold text-emerald-300 truncate">{selectedFile.name}</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                            {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          Đã trỏ file thành công từ máy tính. Bấm để đổi sang file khác.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        fileInputRef.current?.click();
                      }}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-cyan-600 text-slate-200 hover:text-white text-xs font-semibold shrink-0 transition-colors"
                    >
                      Đổi Tệp Khác
                    </button>
                  </div>
                ) : (
                  <div className="space-y-1.5 py-1">
                    <div className="w-11 h-11 rounded-full bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mx-auto group-hover:scale-110 transition-transform shadow-md shadow-cyan-500/10">
                      <FolderOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors block">
                        Nhấp Vào Đây Để Trỏ Trực Tiếp Lấy File Từ Máy Tính
                      </span>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Kéo thả hoặc nhấp để duyệt file Video (.mp4, .mkv) hoặc Hình ảnh (.jpg, .png, .webp)
                      </p>
                    </div>
                    <span className="inline-flex items-center space-x-1.5 text-[10px] font-bold text-cyan-300 bg-cyan-500/15 px-3 py-1 rounded-full border border-cyan-500/30">
                      <FolderOpen className="w-3 h-3" />
                      <span>Trỏ Trực Tiếp File Trên Máy Tính (Browse File)</span>
                    </span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Tiêu Đề Tệp Media <span className="text-cyan-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="VD: TVC Giới Thiệu Sản Phẩm Mùa Thu 2026"
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Loại Media
                  </label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as MediaType)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-500"
                  >
                    <option value="video">Video (MP4 / MKV)</option>
                    <option value="image">Hình Ảnh (Poster / Banner)</option>
                    <option value="ticker">Văn Bản Chữ Chạy</option>
                    <option value="widget">Widget Tiện Ích</option>
                  </select>
                </div>

                {newType === 'video' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Thời Lượng (Giây)
                    </label>
                    <input
                      type="number"
                      value={newDuration}
                      onChange={(e) => setNewDuration(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                )}
              </div>

              {/* Đường Dẫn Media + Nút Chọn File Trực Tiếp */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Đường Dẫn Media (URL / Tệp Cục Bộ)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    placeholder="https://...mp4 hoặc bấm nút [Chọn File] để lấy từ máy"
                    className="flex-1 px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-500 font-mono truncate"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3.5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center space-x-1.5 shrink-0 shadow-md shadow-cyan-600/25 active:scale-95 transition-all"
                    title="Trỏ trực tiếp đến thư mục trên máy tính để chọn file"
                  >
                    <FolderOpen className="w-3.5 h-3.5" />
                    <span>Chọn File</span>
                  </button>
                </div>
              </div>

              {/* Ảnh Thu Nhỏ + Nút Chọn Ảnh Trực Tiếp */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Ảnh Thu Nhỏ (Thumbnail)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newThumb}
                    onChange={(e) => setNewThumb(e.target.value)}
                    placeholder="Để trống hệ thống sẽ tự động gán ảnh đại diện hoặc chọn ảnh từ máy"
                    className="flex-1 px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-500 font-mono truncate"
                  />
                  <button
                    type="button"
                    onClick={() => thumbInputRef.current?.click()}
                    className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-semibold flex items-center space-x-1.5 shrink-0 transition-all"
                    title="Trỏ trực tiếp chọn ảnh đại diện từ máy tính"
                  >
                    <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Chọn Ảnh</span>
                  </button>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsUploadOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-medium"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-md shadow-cyan-600/20"
                >
                  Lưu Vào Thư Viện
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-6 relative">
            <button
              onClick={() => setPreviewItem(null)}
              className="absolute top-4 right-4 p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-white mb-3 pr-8 truncate">
              {previewItem.title}
            </h3>

            <div className="relative aspect-video rounded-xl overflow-hidden bg-black border border-slate-800 flex items-center justify-center">
              {previewItem.type === 'video' ? (
                <video
                  src={previewItem.url}
                  controls
                  autoPlay
                  loop
                  className="w-full h-full object-contain"
                />
              ) : (
                <img
                  src={previewItem.url || previewItem.thumbnail}
                  alt={previewItem.title}
                  className="w-full h-full object-contain"
                />
              )}
            </div>

            <div className="flex items-center justify-between mt-4 text-xs text-slate-400">
              <span>Định dạng: <strong className="text-white uppercase">{previewItem.type}</strong></span>
              <span>Độ phân giải: <strong className="text-white">{previewItem.resolution}</strong></span>
              <span>Kích thước: <strong className="text-white">{previewItem.size}</strong></span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
