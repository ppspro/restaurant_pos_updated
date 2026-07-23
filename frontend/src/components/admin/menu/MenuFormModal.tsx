import React, { useState, useRef, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import ReactCrop, { type Crop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { menuApi } from '../../../api/menu.api';
import { Button } from '../../ui/button';
import { X, UploadCloud, Image as ImageIcon, Check } from 'lucide-react';
import { useNotification } from '../../../components/ui/GlobalNotificationProvider';

interface MenuFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  categories: any[];
  initialData?: any;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string;

function centerAspectCrop(mediaWidth: number, mediaHeight: number, aspect: number) {
  return centerCrop(
    makeAspectCrop({ unit: '%', width: 90 }, aspect, mediaWidth, mediaHeight),
    mediaWidth,
    mediaHeight
  );
}

export default function MenuFormModal({ isOpen, onClose, onSuccess, categories, initialData }: MenuFormModalProps) {
  const { notify } = useNotification();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    itemNumber: initialData?.itemNumber || '',
    name: initialData?.name || '',
    categoryId: initialData?.categoryId || '',
    price: initialData?.price || '',
    itemType: initialData?.itemType || 'KITCHEN',
    isAvailable: initialData?.isAvailable ?? true,
    image: initialData?.image || null,
  });

  const [imgSrc, setImgSrc] = useState('');
  const imgRef = useRef<HTMLImageElement>(null);
  const [crop, setCrop] = useState<Crop>();
  const [isUploading, setIsUploading] = useState(false);

  const onSelectFile = (file: File) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => setImgSrc(reader.result?.toString() || ''));
    reader.readAsDataURL(file);
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      onSelectFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpeg', '.jpg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    multiple: false,
  });

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    setCrop(centerAspectCrop(width, height, 4 / 3));
  };

  const uploadCroppedImage = async () => {
    if (!imgRef.current || !crop || !crop.width || !crop.height) {
      return;
    }
    setIsUploading(true);

    const canvas = document.createElement('canvas');
    const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
    const scaleY = imgRef.current.naturalHeight / imgRef.current.height;

    canvas.width = crop.width * scaleX;
    canvas.height = crop.height * scaleY;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      ctx.drawImage(
        imgRef.current,
        crop.x * scaleX,
        crop.y * scaleY,
        crop.width * scaleX,
        crop.height * scaleY,
        0,
        0,
        crop.width * scaleX,
        crop.height * scaleY
      );

      canvas.toBlob(async (blob) => {
        if (!blob) {
          setIsUploading(false);
          return;
        }
        const data = new FormData();
        data.append('image', blob, 'cropped.jpg');
        try {
          const res = await menuApi.uploadImage(data);
          if (res.data?.success) {
            setFormData({ ...formData, image: res.data.data.imageUrl });
            setImgSrc('');
            notify('success', 'Image uploaded successfully');
          }
        } catch (error) {
          notify('error', 'Upload failed');
        } finally {
          setIsUploading(false);
        }
      }, 'image/jpeg');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const payload = {
        ...formData,
        price: parseFloat(formData.price as string),
        gst: 5.0, // Default GST
      };

      if (initialData?.id) {
        await menuApi.updateMenuItem(initialData.id, payload);
        notify('success', 'Menu item updated successfully');
      } else {
        await menuApi.createMenuItem(payload);
        notify('success', 'Menu item created successfully');
      }
      onSuccess();
      onClose();
    } catch (error) {
      notify('error', 'Failed to save menu item');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveImage = () => {
    setFormData({ ...formData, image: null });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl p-6 m-4 relative border border-gray-100 dark:border-gray-800 my-8">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <X className="h-5 w-5 text-gray-500" />
        </button>

        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          {initialData ? 'Edit Menu Item' : 'Create Menu Item'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Item No. (SKU)</label>
                <input
                  type="text"
                  value={formData.itemNumber}
                  onChange={(e) => setFormData({ ...formData, itemNumber: e.target.value })}
                  className="w-full px-4 py-2 border rounded-xl dark:bg-slate-800 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-gray-300"
                  placeholder="Auto-generated if left blank"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Item Name *</label>
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border rounded-xl dark:bg-slate-800 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  placeholder="e.g. Garlic Bread"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Category *</label>
                <select
                  required
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="w-full px-4 py-2 border rounded-xl dark:bg-slate-800 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                >
                  <option value="">Select Category</option>
                  {categories.map((cat: any) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Price (₹) *</label>
                <input
                  required
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-4 py-2 border rounded-xl dark:bg-slate-800 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Item Type *</label>
                <select
                  required
                  value={formData.itemType}
                  onChange={(e) => setFormData({ ...formData, itemType: e.target.value })}
                  className="w-full px-4 py-2 border rounded-xl dark:bg-slate-800 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                >
                  <option value="KITCHEN">Kitchen (Prints KOT)</option>
                  <option value="PACKED">Packed/Beverage (No KOT)</option>
                </select>
              </div>

              <div className="flex items-center gap-3 mt-6">
                <input
                  type="checkbox"
                  id="isAvailable"
                  checked={formData.isAvailable}
                  onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <label htmlFor="isAvailable" className="text-sm font-semibold text-gray-700 dark:text-gray-300 cursor-pointer">
                  Item is Available
                </label>
              </div>
            </div>

            {/* Image Upload Section */}
            <div className="space-y-4 flex flex-col">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Food Image</label>

              {imgSrc ? (
                <div className="flex flex-col gap-4 border rounded-2xl p-4 bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-gray-700">
                  <ReactCrop crop={crop} onChange={(c) => setCrop(c)} aspect={4/3}>
                    <img ref={imgRef} src={imgSrc} alt="Crop me" onLoad={onImageLoad} className="max-h-64 object-contain mx-auto rounded" />
                  </ReactCrop>
                  <div className="flex gap-2 justify-end">
                    <Button type="button" variant="ghost" onClick={() => setImgSrc('')}>Cancel</Button>
                    <Button type="button" onClick={uploadCroppedImage} disabled={isUploading}>
                      {isUploading ? 'Uploading...' : 'Crop & Upload'}
                    </Button>
                  </div>
                </div>
              ) : formData.image ? (
                <div className="flex flex-col gap-4 border rounded-2xl p-4 bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-gray-700">
                  <div className="w-full h-48 rounded-xl overflow-hidden relative group">
                    <img src={`${API_BASE_URL}${formData.image}`} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button type="button" size="sm" onClick={handleRemoveImage} className="bg-red-600 hover:bg-red-700 text-white border-transparent">
                        Remove Image
                      </Button>
                    </div>
                  </div>
                  <div className="text-center text-sm text-green-600 dark:text-green-400 flex items-center justify-center gap-1 font-medium">
                    <Check className="h-4 w-4" /> Image Uploaded
                  </div>
                </div>
              ) : (
                <div
                  {...getRootProps()}
                  className={`flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-8 cursor-pointer transition-colors h-64 ${
                    isDragActive ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10' : 'border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-slate-800'
                  }`}
                  onPaste={(e) => {
                    const items = e.clipboardData?.items;
                    if (items) {
                      for (let i = 0; i < items.length; i++) {
                        if (items[i].type.indexOf('image') !== -1) {
                          const blob = items[i].getAsFile();
                          if (blob) onSelectFile(blob);
                        }
                      }
                    }
                  }}
                >
                  <input {...getInputProps()} />
                  <div className="h-16 w-16 bg-blue-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                    <UploadCloud className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <p className="text-center text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {isDragActive ? 'Drop image here...' : 'Drag & drop image, or click to browse'}
                  </p>
                  <p className="text-center text-xs text-gray-500 mt-2">
                    Supports JPG, PNG, WEBP (Max 5MB)<br/>
                    Paste from clipboard also supported
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t dark:border-gray-800">
            <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !!imgSrc || isUploading}>
              {isSubmitting ? 'Saving...' : initialData ? 'Update Menu Item' : 'Create Menu Item'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
