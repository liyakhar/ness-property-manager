'use client';

import { format } from 'date-fns';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface CalendarDayDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDay: Date | null;
  selectedDayTenants: Array<{
    id: string;
    name: string;
    apartmentId: string;
    entryDate: Date;
    exitDate?: Date;
  }>;
  filteredProperties: Array<{ id: string; apartmentNumber: string }>;
}

export function CalendarDayDialog({
  open,
  onOpenChange,
  selectedDay,
  selectedDayTenants,
  filteredProperties,
}: CalendarDayDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {selectedDay ? `Занятость на ${format(selectedDay, 'd MMMM yyyy')}` : 'Занятость'}
          </DialogTitle>
        </DialogHeader>
        <div className="max-h-[60vh] space-y-2 overflow-auto">
          {selectedDayTenants.map((tenant) => {
            const property = filteredProperties.find((p) => p.id === tenant.apartmentId);
            if (!property) return null;
            return (
              <div
                key={tenant.id}
                className="flex items-center justify-between rounded border p-2 text-sm"
              >
                <div className="min-w-0">
                  <div className="truncate font-medium text-card-foreground">{tenant.name}</div>
                  <div className="text-xs text-muted-foreground">
                    Кв. #{property.apartmentNumber}
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  {format(new Date(tenant.entryDate), 'd MMM')} –{' '}
                  {tenant.exitDate ? format(new Date(tenant.exitDate), 'd MMM') : '…'}
                </div>
              </div>
            );
          })}
          {selectedDayTenants.length === 0 && (
            <div className="text-muted-foreground text-sm">Нет записей на выбранную дату</div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
