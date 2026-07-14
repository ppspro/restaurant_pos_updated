import { create } from 'zustand';
import type { AnalyticsFilters } from '../lib/analytics.api';

export type ViewState = 'DASHBOARD' | 'ORDERS' | 'RECEIPT';

interface DashboardState {
  filters: AnalyticsFilters;
  viewState: ViewState;
  
  // Actions
  setFilters: (filters: AnalyticsFilters) => void;
  updateFilter: (key: keyof AnalyticsFilters, value: any) => void;
  setViewState: (state: ViewState) => void;
  reset: () => void;
}

const defaultFilters: AnalyticsFilters = { dateRange: 'TODAY' };

export const useDashboardStore = create<DashboardState>((set) => ({
  filters: defaultFilters,
  viewState: 'DASHBOARD',
  
  setFilters: (filters) => set({ filters }),
  
  updateFilter: (key, value) => set((state) => ({
    filters: {
      ...state.filters,
      [key]: value === 'ALL' ? undefined : value
    }
  })),

  setViewState: (viewState) => set({ viewState }),
  
  reset: () => set({ filters: defaultFilters, viewState: 'DASHBOARD' }),
}));
