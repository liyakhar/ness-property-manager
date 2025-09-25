'use client';

import { AlertTriangle, Calendar, DollarSign, Home } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usePropertyManagementStore } from '@/stores/property-management';

interface NotificationItem {
  id: string;
  type: 'entry' | 'urgent' | 'payment' | 'utility';
  title: string;
  description: string;
  daysRemaining?: number;
  isToday?: boolean;
  priority: 'high' | 'medium';
  propertyId: string;
  tenantId?: string;
  dueDate?: Date;
}

export function DailyNotifications() {
  const { properties, tenants, updateProperty } = usePropertyManagementStore();

  const getNotifications = (): NotificationItem[] => {
    const notifications: NotificationItem[] = [];
    const today = new Date();
    const oneWeekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    // Срочные проблемы отображаются только в отдельной карточке, не в уведомлениях

    // 1. Заселение арендаторов - Уведомления о заселении в ближайшие 7 дней
    tenants.forEach((tenant) => {
      if (tenant.status === 'upcoming' || tenant.status === 'future') {
        const entryDate = new Date(tenant.entryDate);
        if (entryDate <= oneWeekFromNow && entryDate >= today) {
          const daysRemaining = Math.ceil(
            (entryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
          );
          const isToday = daysRemaining === 0;

          // Приоритет: высокий (сегодня/завтра), средний (3-7 дней)
          const priority = daysRemaining <= 1 ? 'high' : 'medium';

          const property = properties.find((p) => p.id === tenant.apartmentId);
          if (property) {
            notifications.push({
              id: `entry-${tenant.id}`,
              type: 'entry',
              title: `Заселение арендатора`,
              description: `${tenant.name} заселяется в квартиру ${property.apartmentNumber}`,
              daysRemaining,
              isToday,
              priority,
              propertyId: property.id,
              tenantId: tenant.id,
              dueDate: entryDate,
            });
          }
        }
      }
    });

    // 2. Срочные проблемы — исключены из ежедневных уведомлений

    // 3. Дни оплаты - Уведомления о сроках оплаты аренды
    tenants.forEach((tenant) => {
      if (tenant.status === 'current') {
        const paymentDate = new Date(tenant.receivePaymentDate);
        const nextPaymentDate = new Date(paymentDate);
        nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);

        // Показывать уведомления за 3 дня до оплаты и в день оплаты
        const daysUntilPayment = Math.ceil(
          (nextPaymentDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysUntilPayment <= 3 && daysUntilPayment >= 0) {
          const property = properties.find((p) => p.id === tenant.apartmentId);
          if (property) {
            notifications.push({
              id: `payment-${tenant.id}`,
              type: 'payment',
              title: `День оплаты`,
              description: `${tenant.name} - Квартира ${property.apartmentNumber}`,
              daysRemaining: daysUntilPayment,
              isToday: daysUntilPayment === 0,
              priority: 'medium', // Приоритет: средний
              propertyId: property.id,
              tenantId: tenant.id,
              dueDate: nextPaymentDate,
            });
          }
        }
      }
    });

    // 4. Платеж за счета - Уведомления о сроках оплаты коммунальных услуг
    tenants.forEach((tenant) => {
      if (tenant.status === 'current' && tenant.utilityPaymentDate) {
        const utilityPaymentDate = new Date(tenant.utilityPaymentDate);
        const nextUtilityPaymentDate = new Date(utilityPaymentDate);
        nextUtilityPaymentDate.setMonth(nextUtilityPaymentDate.getMonth() + 1);

        // Показывать уведомления за 3 дня до оплаты и в день оплаты
        const daysUntilUtilityPayment = Math.ceil(
          (nextUtilityPaymentDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        );
        if (daysUntilUtilityPayment <= 3 && daysUntilUtilityPayment >= 0) {
          const property = properties.find((p) => p.id === tenant.apartmentId);
          if (property) {
            notifications.push({
              id: `utility-${tenant.id}`,
              type: 'utility',
              title: `Платеж за счета`,
              description: `${tenant.name} - Квартира ${property.apartmentNumber}`,
              daysRemaining: daysUntilUtilityPayment,
              isToday: daysUntilUtilityPayment === 0,
              priority: 'medium', // Приоритет: средний
              propertyId: property.id,
              tenantId: tenant.id,
              dueDate: nextUtilityPaymentDate,
            });
          }
        }
      }
    });

    // Сортировка по приоритету и времени
    return notifications.sort((a, b) => {
      const priorityOrder = { high: 2, medium: 1 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      return (a.daysRemaining ?? 0) - (b.daysRemaining ?? 0);
    });
  };

  const notifications = getNotifications();

  if (notifications.length === 0) {
    return (
      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-card-foreground">
            <Calendar className="h-5 w-5" />
            Ежедневные Уведомления
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center text-muted-foreground">
            <Calendar className="mx-auto mb-4 h-12 w-12 opacity-50" />
            <p>Нет активных уведомлений</p>
            <p className="text-sm">Все в порядке!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-l-4 border-l-destructive bg-destructive/10';
      case 'medium':
        return 'border-l-4 border-l-orange-500 bg-orange-500/10';
      default:
        return 'border-l-4 border-l-muted-foreground bg-muted/50';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'entry':
        return <Home className="h-4 w-4" />;
      case 'urgent':
        return <AlertTriangle className="h-4 w-4" />;
      case 'payment':
        return <DollarSign className="h-4 w-4" />;
      case 'utility':
        return <DollarSign className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'entry':
        return 'Заселение';
      case 'urgent':
        return 'Срочно';
      case 'payment':
        return 'Оплата';
      case 'utility':
        return 'Счета';
      default:
        return 'Уведомление';
    }
  };

  return (
    <Card className="bg-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-card-foreground">
          <Calendar className="h-5 w-5" />
          Ежедневные Уведомления
          <Badge variant="secondary" className="ml-2">
            {notifications.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`rounded-lg border bg-card p-4 ${getPriorityColor(notification.priority)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex flex-1 items-start gap-3">
                  <div className="text-muted-foreground">{getTypeIcon(notification.type)}</div>
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-2">
                      <Badge variant="outline">{getTypeLabel(notification.type)}</Badge>
                      {notification.daysRemaining !== undefined && (
                        <Badge variant={notification.isToday ? 'destructive' : 'secondary'}>
                          {notification.isToday ? 'Сегодня' : `${notification.daysRemaining} дн.`}
                        </Badge>
                      )}
                    </div>
                    {notification.title && (
                      <h4 className="mb-1 text-sm font-medium text-card-foreground">
                        {notification.title}
                      </h4>
                    )}
                    <p className="text-sm text-muted-foreground">{notification.description}</p>
                  </div>
                </div>

                {/* Кнопка "Решено" только для срочных проблем */}
                {notification.type === 'urgent' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      updateProperty(notification.propertyId, { urgentMatterResolved: true })
                    }
                    className="ml-2"
                  >
                    Решено
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
