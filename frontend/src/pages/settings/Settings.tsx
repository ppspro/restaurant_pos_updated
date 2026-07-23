import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { api } from '../../api/axios';

export default function Settings() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await api.get('/settings');
        setSettings(response.data);
      } catch (error) {
        console.error('Failed to fetch settings', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const checked = (e.target as HTMLInputElement).checked;
    setSettings((prev: any) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.patch('/settings', {
        restaurantName: settings.restaurantName,
        address: settings.address,
        latitude: settings.latitude ? Number(settings.latitude) : null,
        longitude: settings.longitude ? Number(settings.longitude) : null,
        city: settings.city,
        country: settings.country,
        timezone: settings.timezone,
        weatherEnabled: settings.weatherEnabled,
        temperatureUnit: settings.temperatureUnit
      });
      alert('Settings saved successfully');
    } catch (error) {
      console.error('Failed to save settings', error);
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8">Loading settings...</div>;

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white">Restaurant Settings</h1>
      
      <form onSubmit={handleSave}>
        <Card className="border-border bg-card shadow-sm mb-6 rounded-[20px]">
          <CardHeader>
            <CardTitle>Location & Weather</CardTitle>
            <CardDescription>Configure the restaurant's location for accurate weather and timezone data.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Restaurant Name</label>
                <Input name="restaurantName" value={settings?.restaurantName || ''} onChange={handleChange} required />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">City</label>
                <Input name="city" value={settings?.city || ''} onChange={handleChange} />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Country</label>
                <Input name="country" value={settings?.country || ''} onChange={handleChange} />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Timezone</label>
                <Input name="timezone" value={settings?.timezone || ''} onChange={handleChange} placeholder="e.g. Asia/Kolkata" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Latitude (Optional)</label>
                <Input name="latitude" type="number" step="any" value={settings?.latitude || ''} onChange={handleChange} />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Longitude (Optional)</label>
                <Input name="longitude" type="number" step="any" value={settings?.longitude || ''} onChange={handleChange} />
              </div>
            </div>

            <div className="flex items-center gap-4 mt-6 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  name="weatherEnabled" 
                  checked={settings?.weatherEnabled ?? true} 
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Enable Weather Widget</label>
              </div>
              
              <div className="flex items-center gap-2 ml-8">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Temperature Unit:</label>
                <select 
                  name="temperatureUnit" 
                  value={settings?.temperatureUnit || 'C'} 
                  onChange={handleChange}
                  className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="C">Celsius (°C)</option>
                  <option value="F">Fahrenheit (°F)</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={saving} className="px-8 rounded-xl font-bold shadow-sm">
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </form>
    </div>
  );
}
