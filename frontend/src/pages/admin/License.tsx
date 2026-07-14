import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Key, Shield, HelpCircle, CheckCircle2, Clock } from 'lucide-react';

export default function License() {
  const [license, setLicense] = useState({
    key: 'LIC-EXP-9204-8392-0948-2834-8239',
    status: 'ACTIVE',
    expiry: '2027-01-10',
    activatedAt: '2026-01-10',
    type: 'Enterprise SaaS Tier',
    terminalLimit: '10 POS Hardware Registers',
    version: 'v2.8.5-LTS'
  });

  return (
    <div className="p-8 space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-[10px] font-extrabold tracking-widest text-blue-500 uppercase">System Entitlements</span>
          <h1 className="text-3xl font-black tracking-tight text-gray-950 dark:text-white mt-1">Platform License</h1>
          <p className="text-muted-foreground text-sm">Activate enterprise POS features, verify license parameters, and check version numbers.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Core parameters */}
        <div className="xl:col-span-2 space-y-6">
          <Card className="border border-border bg-card rounded-2xl overflow-hidden shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-extrabold flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-500" /> Active System License
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">Global product keys loaded into POS registers.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-xs space-y-2.5 bg-slate-50/50 dark:bg-slate-950/20 p-4 rounded-xl border border-border">
                <div className="flex justify-between"><span className="text-muted-foreground font-semibold">License Key:</span><span className="font-mono font-bold text-gray-900 dark:text-white">{license.key}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground font-semibold">SaaS Tier:</span><span className="font-bold text-gray-900 dark:text-white">{license.type}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground font-semibold">Hardware Limit:</span><span className="font-bold text-gray-900 dark:text-white">{license.terminalLimit}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground font-semibold">Activation Date:</span><span className="font-bold text-gray-900 dark:text-white">{license.activatedAt}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground font-semibold">Version:</span><span className="font-bold font-mono text-gray-900 dark:text-white">{license.version}</span></div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Side panel: Status card */}
        <div className="space-y-6">
          <Card className="border border-border bg-card rounded-2xl overflow-hidden shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-extrabold flex items-center gap-2">
                <Key className="w-5 h-5 text-blue-500" /> Status Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3.5 bg-slate-50/50 dark:bg-slate-950/20 rounded-xl border border-border">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="text-xs font-bold text-muted-foreground">Status</span>
                </div>
                <Badge className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                  {license.status}
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3.5 bg-slate-50/50 dark:bg-slate-950/20 rounded-xl border border-border">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-500" />
                  <span className="text-xs font-bold text-muted-foreground">Expiry</span>
                </div>
                <span className="text-xs font-bold text-gray-900 dark:text-white">{license.expiry}</span>
              </div>

              <Button disabled variant="outline" className="w-full h-11 text-xs font-bold rounded-xl border-border text-muted-foreground">
                Upload New License Key
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
