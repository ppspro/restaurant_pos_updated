import React, { useState } from 'react';
import { useBillingStore } from '../../store/billing.store';
import { Button } from '../ui/button';
import { Bookmark, Search, Layers, Sparkles, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { Input } from '../ui/input';

export const CategorySidebar = () => {
  const { categories, selectedCategoryId, setSelectedCategoryId } = useBillingStore();
  const [collapsed, setCollapsed] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');

  const filteredCategories = categories.filter(c =>
    c.name.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <aside
      className={`relative flex flex-col gap-3 bg-white dark:bg-slate-900 border-r border-gray-150 dark:border-gray-800 transition-all duration-350 shrink-0 md:h-full select-none ${
        collapsed ? 'w-16 p-2' : 'w-full md:w-56 p-4'
      }`}
    >
      {/* Collapse Toggle Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-4 h-6 w-6 rounded-full border border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900 shadow-sm z-10 hidden md:flex items-center justify-center text-gray-500 hover:text-blue-500"
      >
        {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
      </Button>

      {/* Sidebar Header */}
      {!collapsed && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-wider font-extrabold text-gray-400 flex items-center gap-1.5">
              <Filter className="w-3 h-3 text-blue-500" /> Categories
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400">
              {categories.length}
            </span>
          </div>

          {/* Search Category */}
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search category..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="pl-9 h-8 text-xs rounded-lg border-gray-200 focus-visible:ring-1 focus-visible:ring-blue-500 dark:bg-slate-950 dark:border-gray-850"
            />
          </div>
        </div>
      )}

      {/* Categories Scroller */}
      <div className="flex flex-row md:flex-col gap-2.5 overflow-x-auto md:overflow-y-auto flex-1 pr-1">
        {/* All Items Option */}
        <Button
          variant={selectedCategoryId === null ? 'default' : 'outline'}
          onClick={() => setSelectedCategoryId(null)}
          className={`justify-start gap-3 h-11 shrink-0 transition-all rounded-xl ${
            selectedCategoryId === null
              ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/10'
              : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 border-gray-200 dark:border-gray-800'
          } ${collapsed ? 'w-11 px-0 justify-center' : 'w-full px-3'}`}
          title="All Items"
        >
          <span className="text-base">🍽️</span>
          {!collapsed && <span className="text-xs font-semibold">All Items</span>}
        </Button>

        {/* Dynamic Category List */}
        {filteredCategories.map((c) => {
          const isSelected = selectedCategoryId === c.id;
          return (
            <Button
              key={c.id}
              variant={isSelected ? 'default' : 'outline'}
              onClick={() => setSelectedCategoryId(c.id)}
              className={`group justify-start gap-3 h-11 shrink-0 transition-all rounded-xl ${
                isSelected
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/10'
                  : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 border-gray-200 dark:border-gray-800'
              } ${collapsed ? 'w-11 px-0 justify-center' : 'w-full px-3'}`}
              title={c.name}
            >
              <span className="text-base group-hover:scale-115 transition-transform duration-200">{c.icon}</span>
              {!collapsed && (
                <>
                  <span className="text-xs font-semibold truncate text-left">{c.name}</span>
                  <span className={`h-2 w-2 rounded-full ml-auto ${c.color} shadow-sm shrink-0`} />
                </>
              )}
            </Button>
          );
        })}

        {!collapsed && (
          <>
            <div className="border-t border-gray-150 dark:border-gray-800 my-2 hidden md:block"></div>

            {/* Quick Filter: Popular */}
            <Button
              variant={selectedCategoryId === 'favorites' ? 'default' : 'outline'}
              onClick={() => setSelectedCategoryId('favorites')}
              className={`justify-start gap-3 h-11 shrink-0 transition-all rounded-xl ${
                selectedCategoryId === 'favorites'
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/10'
                  : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 border-gray-200 dark:border-gray-800'
              } w-full px-3`}
            >
              <Sparkles className="h-4.5 w-4.5 text-amber-500 group-hover:rotate-12 transition-transform" />
              <span className="text-xs font-semibold text-left">Popular / Featured</span>
            </Button>
          </>
        )}
      </div>
    </aside>
  );
};
export default CategorySidebar;
