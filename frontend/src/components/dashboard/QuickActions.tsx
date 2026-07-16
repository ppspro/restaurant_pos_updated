import { PlayCircle, FileText, Settings, Printer } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Button variant="outline" className="h-20 flex-col gap-2">
          <PlayCircle className="h-5 w-5 text-primary" />
          <span className="text-xs">Open Shift</span>
        </Button>
        <Button variant="outline" className="h-20 flex-col gap-2">
          <FileText className="h-5 w-5 text-primary" />
          <span className="text-xs">EOD Report</span>
        </Button>
        <Button variant="outline" className="h-20 flex-col gap-2">
          <Printer className="h-5 w-5 text-primary" />
          <span className="text-xs">Test Printers</span>
        </Button>
        <Button variant="outline" className="h-20 flex-col gap-2">
          <Settings className="h-5 w-5 text-primary" />
          <span className="text-xs">Settings</span>
        </Button>
      </CardContent>
    </Card>
  );
}
