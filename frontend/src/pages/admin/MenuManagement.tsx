import React, { useEffect, useState } from 'react';
import { categoryApi } from '../../api/category.api';
import { menuApi } from '../../api/menu.api';
import MenuFormModal from '../../components/admin/menu/MenuFormModal';
import { Button } from '../../components/ui/button';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { useNotification } from '../../components/ui/GlobalNotificationProvider';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string;

export default function MenuManagement() {
  const { notify } = useNotification();
  const [categories, setCategories] = useState<any[]>([]);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

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
        <Button onClick={handleCreate} className="flex items-center gap-2">
          <Plus className="w-4 h-4" /> Create Menu Item
        </Button>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Categories ({categories.length})</h2>
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <span key={c.id} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
              {c.name}
            </span>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {menuItems.map((item) => {
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
              })}
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
