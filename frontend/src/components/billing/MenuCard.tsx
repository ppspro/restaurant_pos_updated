import React from 'react';
import { useBillingStore } from '../../store/billing.store';
import type { MenuItem } from '../../store/billing.store';
import { Button } from '../ui/button';
import { ShoppingCart, AlertCircle, ChefHat, Package, Plus, Sparkles } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string;

interface MenuCardProps {
  item: MenuItem;
  referenceNumber?: number;
}

// Map emoji or icon placeholders per item category/name to look premium
const getItemVisual = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes('dosa')) return { emoji: '🥞', gradient: 'from-amber-500 to-orange-500' };
  if (n.includes('combo') || n.includes('idli')) return { emoji: '🍛', gradient: 'from-orange-400 to-red-500' };
  if (n.includes('water')) return { emoji: '💧', gradient: 'from-blue-400 to-sky-500' };
  if (n.includes('drink') || n.includes('drink')) return { emoji: '🥤', gradient: 'from-red-400 to-rose-600' };
  if (n.includes('noodles')) return { emoji: '🍜', gradient: 'from-yellow-400 to-amber-500' };
  if (n.includes('chips')) return { emoji: '🍿', gradient: 'from-orange-400 to-yellow-500' };
  return { emoji: '🍔', gradient: 'from-blue-500 to-indigo-600' };
};

export const MenuCard = React.memo(({ item, referenceNumber }: MenuCardProps) => {
  const addToCart = useBillingStore((state) => state.addToCart);
  const visual = getItemVisual(item.name);
  const [isFlashing, setIsFlashing] = React.useState(false);

  React.useEffect(() => {
    const handleFlash = (e: CustomEvent) => {
      if (e.detail === item.id) {
        setIsFlashing(true);
        setTimeout(() => setIsFlashing(false), 200);
      }
    };
    window.addEventListener('quick-select-flash', handleFlash as EventListener);
    return () => window.removeEventListener('quick-select-flash', handleFlash as EventListener);
  }, [item.id]);


  return (
    <div
      onClick={() => item.isAvailable && addToCart(item)}
      className={`group relative flex flex-col justify-between bg-white dark:bg-slate-900 border rounded-2xl shadow-sm transition-all duration-200 select-none overflow-hidden ${
        isFlashing ? 'ring-4 ring-green-500 scale-[1.02] bg-green-50/50 dark:bg-green-900/20' : ''
      } ${
        item.isAvailable
          ? 'cursor-pointer hover:shadow-md hover:border-blue-500 hover:-translate-y-0.5 border-gray-150 dark:border-gray-800'
          : 'opacity-55 bg-gray-50/50 dark:bg-slate-950/20 border-gray-100 dark:border-gray-850 cursor-not-allowed'
      }`}
    >
      {/* Top Image Section (180px) */}
      <div className="h-[180px] w-full relative overflow-hidden bg-gray-100 dark:bg-gray-800">
        <img 
          src={item.image ? `${API_BASE_URL}${item.image}` : '/images/default-food.png'} 
          alt={item.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
        
        {/* Badges Overlay on Image */}
        <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
          <span
            className={`inline-flex items-center gap-1.5 text-[10px] font-extrabold tracking-wider uppercase px-2.5 py-1 rounded-lg backdrop-blur-md shadow-sm ${
              item.itemType === 'KITCHEN'
                ? 'bg-blue-500/90 text-white'
                : 'bg-orange-500/90 text-white'
            }`}
          >
            {item.itemType === 'KITCHEN' ? <ChefHat className="h-3.5 w-3.5" /> : <Package className="h-3.5 w-3.5" />}
            {item.itemType}
          </span>
          {item.isFeatured && (
            <span className="inline-flex items-center gap-1 bg-amber-500/90 text-white text-[9px] font-black tracking-wider uppercase px-2.5 py-1 rounded-lg backdrop-blur-md shadow-sm">
              <Sparkles className="w-3 h-3" /> Featured
            </span>
          )}
        </div>
      </div>

      <div className="p-4 pt-3 flex flex-col flex-grow">
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1.5">
            {referenceNumber && (
              <span className="font-mono text-[11px] font-black tracking-widest bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded">
                #{referenceNumber}
              </span>
            )}
            <span className="font-mono text-[11px] font-black tracking-widest text-slate-800 dark:text-slate-300">
              {item.itemNumber}
            </span>
          </div>
          <h4 className="font-extrabold text-[15px] text-gray-900 dark:text-white leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 mt-0.5">
            {item.name}
          </h4>
        </div>
        
        <div className="flex justify-between items-center mt-1.5 text-xs text-gray-500 font-medium">
          <span className="font-mono text-gray-400">{item.shortCode}</span>
          <span>GST: 5%</span>
        </div>
      </div>

      <div className="px-4 pb-4 mt-auto flex items-end justify-between">
        <span className="text-sm font-extrabold text-gray-900 dark:text-white">
          ₹{item.price.toFixed(2)}
        </span>
        {item.isAvailable ? (
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0 rounded-full bg-blue-500/10 text-blue-600 hover:bg-blue-600 hover:text-white group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm flex items-center justify-center"
          >
            <Plus className="h-4 w-4" />
          </Button>
        ) : (
          <span className="text-[10px] text-red-500 font-bold flex items-center gap-0.5 bg-red-500/10 px-2 py-0.5 rounded-full">
            <AlertCircle className="h-3 w-3" /> Out
          </span>
        )}
      </div>
    </div>
  );
});
MenuCard.displayName = 'MenuCard';
export default MenuCard;
