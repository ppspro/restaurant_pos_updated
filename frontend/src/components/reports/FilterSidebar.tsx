import React from 'react';
import { Filter, Calendar, Users, LayoutGrid, Monitor, CreditCard } from 'lucide-react';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { ScrollArea } from '../ui/scroll-area';

export function FilterSidebar() {
  return (
    <div className="w-64 border-r bg-card h-[calc(100vh-140px)] flex flex-col">
      <div className="p-4 border-b flex items-center justify-between">
        <h3 className="font-semibold flex items-center">
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </h3>
        <Button variant="ghost" size="sm" className="h-8 text-xs text-muted-foreground">Clear</Button>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center text-muted-foreground">
              <Calendar className="h-4 w-4 mr-2" />
              Date Range
            </label>
            <Select defaultValue="today">
              <SelectTrigger>
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="yesterday">Yesterday</SelectItem>
                <SelectItem value="this-week">This Week</SelectItem>
                <SelectItem value="this-month">This Month</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center text-muted-foreground">
              <Users className="h-4 w-4 mr-2" />
              Cashier
            </label>
            <Select defaultValue="all">
              <SelectTrigger>
                <SelectValue placeholder="All Cashiers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cashiers</SelectItem>
                <SelectItem value="john">John Doe</SelectItem>
                <SelectItem value="jane">Jane Smith</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center text-muted-foreground">
              <LayoutGrid className="h-4 w-4 mr-2" />
              Category
            </label>
            <Select defaultValue="all">
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="food">Food</SelectItem>
                <SelectItem value="beverage">Beverage</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center text-muted-foreground">
              <CreditCard className="h-4 w-4 mr-2" />
              Payment Method
            </label>
            <Select defaultValue="all">
              <SelectTrigger>
                <SelectValue placeholder="All Methods" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Methods</SelectItem>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="upi">UPI</SelectItem>
                <SelectItem value="card">Card</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center text-muted-foreground">
              <Monitor className="h-4 w-4 mr-2" />
              Terminal
            </label>
            <Select defaultValue="all">
              <SelectTrigger>
                <SelectValue placeholder="All Terminals" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Terminals</SelectItem>
                <SelectItem value="pos-1">POS-1 Main</SelectItem>
                <SelectItem value="pos-2">POS-2 Secondary</SelectItem>
              </SelectContent>
            </Select>
          </div>

        </div>
      </ScrollArea>
      
      <div className="p-4 border-t bg-muted/20">
        <Button className="w-full">Apply Filters</Button>
      </div>
    </div>
  );
}
