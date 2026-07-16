import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Landmark, Settings, Currency, Clock, Percent, Globe, Save } from 'lucide-react';

export default function SystemConfig() {
  const [settings, setSettings] = useState({
    restaurantName: 'Express Diner',
    address: '123 Main Street, Bangalore, KA, India',
    phone: '+91 98765 43210',
    email: 'ops@expressdiner.com',
    gstNumber: '29AAAAA0000A1Z5',
    currency: 'INR (₹)',
    timezone: 'Asia/Kolkata (GMT+05:30)',
    receiptFooter: 'Thank you for dining with us!'
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    alert('System configuration settings saved successfully.');
  };

  return (
    <div className="p-8 space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-[10px] font-extrabold tracking-widest text-blue-500 uppercase">Restaurant Operations</span>
          <h1 className="text-3xl font-black tracking-tight text-gray-950 dark:text-white mt-1">System Settings</h1>
          <p className="text-muted-foreground text-sm">Configure currency, taxes, tax IDs, details, and receipt configurations.</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column: Metadata */}
        <div className="xl:col-span-2 space-y-6">
          <Card className="border border-border bg-card rounded-2xl overflow-hidden shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-extrabold flex items-center gap-2">
                <Landmark className="w-5 h-5 text-blue-500" /> Restaurant Metadata
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">Global identifiers printed on customer KOTs and receipts.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="restaurantName" className="text-xs font-semibold text-muted-foreground">Restaurant Name</Label>
                  <Input
                    id="restaurantName"
                    value={settings.restaurantName}
                    onChange={(e) => setSettings({ ...settings, restaurantName: e.target.value })}
                    className="h-10 text-xs border border-border bg-card text-foreground rounded-xl focus-visible:ring-1 focus-visible:ring-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-xs font-semibold text-muted-foreground">Phone Contact</Label>
                  <Input
                    id="phone"
                    value={settings.phone}
                    onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                    className="h-10 text-xs border border-border bg-card text-foreground rounded-xl focus-visible:ring-1 focus-visible:ring-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-xs font-semibold text-muted-foreground">Email Address</Label>
                  <Input
                    id="email"
                    value={settings.email}
                    onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                    className="h-10 text-xs border border-border bg-card text-foreground rounded-xl focus-visible:ring-1 focus-visible:ring-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gstNumber" className="text-xs font-semibold text-muted-foreground">GST / Tax Identification ID</Label>
                  <Input
                    id="gstNumber"
                    value={settings.gstNumber}
                    onChange={(e) => setSettings({ ...settings, gstNumber: e.target.value })}
                    className="h-10 text-xs border border-border bg-card text-foreground rounded-xl focus-visible:ring-1 focus-visible:ring-blue-500"
                  />
                </div>
                <div className="sm:col-span-2 space-y-2">
                  <Label htmlFor="address" className="text-xs font-semibold text-muted-foreground">Location Address</Label>
                  <Input
                    id="address"
                    value={settings.address}
                    onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                    className="h-10 text-xs border border-border bg-card text-foreground rounded-xl focus-visible:ring-1 focus-visible:ring-blue-500"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-border bg-card rounded-2xl overflow-hidden shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-extrabold flex items-center gap-2">
                <Settings className="w-5 h-5 text-blue-500" /> Receipt Configurations
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">Customize the receipt footer layout details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="receiptFooter" className="text-xs font-semibold text-muted-foreground">Receipt Footer Note</Label>
                <Input
                  id="receiptFooter"
                  value={settings.receiptFooter}
                  onChange={(e) => setSettings({ ...settings, receiptFooter: e.target.value })}
                  className="h-10 text-xs border border-border bg-card text-foreground rounded-xl focus-visible:ring-1 focus-visible:ring-blue-500"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Localizations */}
        <div className="space-y-6">
          <Card className="border border-border bg-card rounded-2xl overflow-hidden shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-extrabold flex items-center gap-2">
                <Globe className="w-5 h-5 text-blue-500" /> Regional Settings
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">Time and currency localization options.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-muted-foreground">Primary Currency</Label>
                <Input
                  disabled
                  value={settings.currency}
                  className="h-10 text-xs border border-border bg-slate-50/50 dark:bg-slate-950/20 text-muted-foreground rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-muted-foreground">System Timezone</Label>
                <Input
                  disabled
                  value={settings.timezone}
                  className="h-10 text-xs border border-border bg-slate-50/50 dark:bg-slate-950/20 text-muted-foreground rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-muted-foreground">Tax Type</Label>
                <Input
                  disabled
                  value="GST (5.0%)"
                  className="h-10 text-xs border border-border bg-slate-50/50 dark:bg-slate-950/20 text-muted-foreground rounded-xl"
                />
              </div>
              
              <Button type="submit" className="w-full h-11 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2">
                <Save className="w-4 h-4" /> Save Configuration
              </Button>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
}
