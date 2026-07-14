import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Package, Users, ShoppingCart, AlertTriangle, Layers } from 'lucide-react';

export default function InventoryLayout() {
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/inventory', icon: Package },
    { name: 'Ingredients', path: '/inventory/ingredients', icon: Layers },
    { name: 'Vendors', path: '/inventory/vendors', icon: Users },
    { name: 'Purchases', path: '/inventory/purchases', icon: ShoppingCart },
    { name: 'Alerts', path: '/inventory/alerts', icon: AlertTriangle },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventory & Stock</h1>
          <p className="text-muted-foreground mt-1">Manage ingredients, stock movements, and purchases.</p>
        </div>
      </div>

      <nav className="flex space-x-2 border-b pb-4 overflow-x-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || (item.path !== '/inventory' && location.pathname.startsWith(item.path));
          
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                isActive 
                  ? 'bg-primary text-primary-foreground' 
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <Icon className="w-4 h-4 mr-2" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="pt-4">
        <Outlet />
      </div>
    </div>
  );
}
