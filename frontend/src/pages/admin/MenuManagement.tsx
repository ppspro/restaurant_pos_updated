import React, { useEffect, useState } from 'react';
import { categoryApi } from '../../api/category.api';
import { menuApi } from '../../api/menu.api';
import MenuFormModal from '../../components/admin/menu/MenuFormModal';
import { Button } from '../../components/ui/button';
import { Plus, Edit, Trash2, Download, Upload } from 'lucide-react';
import { useNotification } from '../../components/ui/GlobalNotificationProvider';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string;

export default function MenuManagement() {
  const { notify } = useNotification();
  const [categories, setCategories] = useState<any[]>([]);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [catRes, menuRes] = await Promise.all([
        categoryApi.getCategories(),
        menuApi.getMenuItems(),
      ]);
      console.log('catRes:', catRes.data);
      console.log('menuRes:', menuRes.data);
      setCategories(catRes.data.data || []);
      setMenuItems(menuRes.data.data || []);
    } catch (error: any) {
      console.error('Failed to load menu data', error);
      if (error.response) {
        console.error('Error Response:', error.response.data);
      }
      notify('error', 'Failed to load menu data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this menu item?')) {
      try {
        await menuApi.deleteMenuItem(id);
        notify('success', 'Menu item deleted successfully');
        fetchData();
      } catch (error) {
        notify('error', 'Failed to delete menu item');
      }
    }
  };

  const handleExport = async () => {
    try {
      notify('info', 'Starting export...');
      window.open(`${API_BASE_URL}/api/v1/menu/export`, '_blank');
    } catch (error) {
      notify('error', 'Export failed');
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      notify('info', 'Importing menu items...');
      const res = await fetch(`${API_BASE_URL}/api/v1/menu/import`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        notify('success', `Imported ${data.imported}, Updated ${data.updated}. Errors: ${data.errors.length}`);
        fetchData();
      } else {
        notify('error', data.message || 'Import failed');
      }
    } catch (error) {
      notify('error', 'Import failed');
    }
    // reset file input
    e.target.value = '';
  };

  if (isLoading) {
    return <div className="p-8">Loading Menu Management...</div>;
  }

  console.log(categories);
  console.log(menuItems);

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Menu Management</h1>
          <p className="text-gray-500">Manage your restaurant categories and items here.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport} className="flex items-center gap-2 border-gray-200">
            <Download className="w-4 h-4" /> Export
          </Button>
          <label className="cursor-pointer">
            <input type="file" className="hidden" accept=".xlsx, .xls" onChange={handleImport} />
            <div className="h-10 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm font-medium rounded-md shadow-sm transition-colors flex items-center gap-2">
              <Upload className="w-4 h-4" /> Import
            </div>
          </label>
          <Button onClick={handleCreate} className="flex items-center gap-2">
            <Plus className="w-4 h-4" /> Create Menu Item
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="w-full md:w-96 relative">
          <input
            type="text"
            placeholder="Search by name, item no..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <div className="absolute left-3 top-2.5 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Categories ({categories.length})</h2>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategoryId(null)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              selectedCategoryId === null
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            All
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategoryId(c.id === selectedCategoryId ? null : c.id)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                selectedCategoryId === c.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Menu Items ({menuItems.length})</h2>
        <div className="bg-white dark:bg-gray-800 border rounded-lg shadow-sm overflow-hidden overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item No.</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {(() => {
                let filtered = menuItems;
                if (selectedCategoryId) {
                  filtered = filtered.filter(i => i.categoryId === selectedCategoryId);
                }
                if (searchQuery.trim()) {
                  const q = searchQuery.toLowerCase().trim();
                  filtered = filtered.filter(i => {
                    const c = categories.find(cat => cat.id === i.categoryId);
                    return i.name.toLowerCase().includes(q) || 
                           i.itemNumber.toLowerCase().includes(q) ||
                           (c && c.name.toLowerCase().includes(q));
                  });
                }
                if (filtered.length === 0) {
                  return (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                        <div className="flex flex-col items-center justify-center">
                          <svg className="w-12 h-12 mb-4 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <p className="text-lg font-medium">No menu items found</p>
                          <p className="text-sm mt-1">Try changing your search or category filter.</p>
                        </div>
                      </td>
                    </tr>
                  );
                }
                return filtered.map((item) => {
                  const category = categories.find((c) => c.id === item.categoryId);
                  const imgSrc = item.image ? `${API_BASE_URL}${item.image}` : '/images/default-food.png';
                  return (
                    <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-12 w-12 rounded-lg overflow-hidden border border-gray-200 shadow-sm relative group cursor-pointer">
                          <img src={imgSrc} alt={item.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                          <div className="fixed hidden group-hover:block z-50 transform translate-x-14 -translate-y-10 w-48 h-48 bg-white border shadow-2xl rounded-xl overflow-hidden">
                             <img src={imgSrc} alt={item.name} className="w-full h-full object-cover" />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-white">{item.itemNumber}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{item.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{category?.name || 'Unknown'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">₹{item.price}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        <span className={`px-2 py-1 text-[10px] font-bold rounded-full ${item.itemType === 'KITCHEN' ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'}`}>
                          {item.itemType}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(item)}>
                          <Edit className="w-4 h-4 text-blue-600" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)}>
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </td>
                    </tr>
                  );
                });
              })()}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <MenuFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={fetchData}
          categories={categories}
          initialData={editingItem}
        />
      )}
    </div>
  );
}
