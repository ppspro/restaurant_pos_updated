import React from 'react';
import { Filter, Calendar as CalendarIcon, User, Monitor, CreditCard, LayoutGrid } from 'lucide-react';
import { Button } from '../ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Calendar } from '../ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { format } from 'date-fns';
import type { AnalyticsFilters, DateRange } from '../../hooks/useAnalytics';

interface DashboardFiltersProps {
  filters: AnalyticsFilters;
  onChange: (filters: AnalyticsFilters) => void;
  cashiers?: { id: string; name: string }[];
  terminals?: { id: string; name: string }[];
  categories?: { id: string; name: string }[];
}

export function DashboardFilters({ filters, onChange, cashiers = [], terminals = [], categories = [] }: DashboardFiltersProps) {
  
  const updateFilter = (key: keyof AnalyticsFilters, value: any) => {
    onChange({ ...filters, [key]: value === 'ALL' ? undefined : value });
  };

  return (
    <div className="flex flex-wrap items-center gap-2 mb-6 p-4 bg-muted/20 border rounded-lg">
      <div className="flex items-center gap-2 mr-2 text-sm font-medium text-muted-foreground">
        <Filter className="h-4 w-4" />
        Filters:
      </div>

      {/* Date Range Preset */}
      <Select value={filters.dateRange || 'TODAY'} onValueChange={(v) => updateFilter('dateRange', v as DateRange)}>
        <SelectTrigger className="w-[140px] h-9">
          <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
          <SelectValue placeholder="Select Date" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="TODAY">Today</SelectItem>
          <SelectItem value="YESTERDAY">Yesterday</SelectItem>
          <SelectItem value="THIS_WEEK">This Week</SelectItem>
          <SelectItem value="THIS_MONTH">This Month</SelectItem>
          <SelectItem value="THIS_YEAR">This Year</SelectItem>
          <SelectItem value="CUSTOM">Custom Range</SelectItem>
        </SelectContent>
      </Select>

      {/* Custom Date Pickers */}
      {filters.dateRange === 'CUSTOM' && (
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="h-9 w-[130px] justify-start text-left font-normal px-3">
                {filters.startDate ? format(new Date(filters.startDate), 'MMM dd, yyyy') : 'Start Date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar 
                mode="single" 
                selected={filters.startDate ? new Date(filters.startDate) : undefined} 
                onSelect={(d: Date | undefined) => updateFilter('startDate', d?.toISOString())} 
              />
            </PopoverContent>
          </Popover>
          <span className="text-muted-foreground text-sm">-</span>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="h-9 w-[130px] justify-start text-left font-normal px-3">
                {filters.endDate ? format(new Date(filters.endDate), 'MMM dd, yyyy') : 'End Date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar 
                mode="single" 
                selected={filters.endDate ? new Date(filters.endDate) : undefined} 
                onSelect={(d: Date | undefined) => updateFilter('endDate', d?.toISOString())} 
              />
            </PopoverContent>
          </Popover>
        </div>
      )}

      {/* Cashier Filter */}
      {cashiers.length > 0 && (
        <Select value={filters.cashierId || 'ALL'} onValueChange={(v) => updateFilter('cashierId', v)}>
          <SelectTrigger className="w-[140px] h-9">
            <User className="mr-2 h-4 w-4 text-muted-foreground" />
            <SelectValue placeholder="All Cashiers" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Cashiers</SelectItem>
            {cashiers.map(c => (
              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* Terminal Filter */}
      {terminals.length > 0 && (
        <Select value={filters.terminalId || 'ALL'} onValueChange={(v) => updateFilter('terminalId', v)}>
          <SelectTrigger className="w-[140px] h-9">
            <Monitor className="mr-2 h-4 w-4 text-muted-foreground" />
            <SelectValue placeholder="All Terminals" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Terminals</SelectItem>
            {terminals.map(t => (
              <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* Payment Filter */}
      <Select value={filters.paymentMethod || 'ALL'} onValueChange={(v) => updateFilter('paymentMethod', v)}>
        <SelectTrigger className="w-[150px] h-9">
          <CreditCard className="mr-2 h-4 w-4 text-muted-foreground" />
          <SelectValue placeholder="All Payments" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All Payments</SelectItem>
          <SelectItem value="CASH">Cash</SelectItem>
          <SelectItem value="UPI">UPI</SelectItem>
          <SelectItem value="CARD">Card</SelectItem>
        </SelectContent>
      </Select>

      {/* Category Filter */}
      {categories.length > 0 && (
        <Select value={filters.categoryId || 'ALL'} onValueChange={(v) => updateFilter('categoryId', v)}>
          <SelectTrigger className="w-[150px] h-9">
            <LayoutGrid className="mr-2 h-4 w-4 text-muted-foreground" />
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Categories</SelectItem>
            {categories.map(c => (
              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* Clear Button */}
      {Object.keys(filters).length > 1 && (
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-9 ml-auto text-muted-foreground hover:text-foreground"
          onClick={() => onChange({ dateRange: 'TODAY' })}
        >
          Clear Filters
        </Button>
      )}
    </div>
  );
}
