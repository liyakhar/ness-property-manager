"use client";

import React from "react";
import { AlertTriangle, Calendar, DollarSign, Home } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePropertyManagementStore } from "@/stores/property-management";

interface NotificationItem {
  id: string;
  type: "entry" | "urgent" | "payment";
  title: string;
  description: string;
  daysRemaining?: number;
  isToday?: boolean;
  priority: "high" | "medium" | "low";
  propertyId: string;
  tenantId?: string;
}

export function DailyNotifications() {
  const { properties, tenants, updateProperty } = usePropertyManagementStore();

  const getNotifications = (): NotificationItem[] => {
    const notifications: NotificationItem[] = [];
    const today = new Date();
    const oneWeekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    // Check for upcoming tenant entries
    tenants.forEach((tenant) => {
      if (tenant.status === "upcoming" || tenant.status === "future") {
        const entryDate = new Date(tenant.entryDate);
        if (entryDate <= oneWeekFromNow && entryDate >= today) {
          const daysRemaining = Math.ceil((entryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          const isToday = daysRemaining === 0;
          
          const property = properties.find(p => p.id === tenant.apartmentId);
          if (property) {
            notifications.push({
              id: `entry-${tenant.id}`,
              type: "entry",
              title: `Заселение арендатора`,
              description: `${tenant.name} заселяется в квартиру ${property.apartmentNumber}`,
              daysRemaining,
              isToday,
              priority: isToday ? "high" : daysRemaining <= 2 ? "high" : "medium",
              propertyId: property.id,
              tenantId: tenant.id,
            });
          }
        }
      }
    });

    // Check for urgent matters
    properties.forEach((property) => {
      if (property.urgentMatter && !property.urgentMatterResolved) {
        const propertyTenant = tenants.find(t => t.apartmentId === property.id && t.status === "current");
        notifications.push({
          id: `urgent-${property.id}`,
          type: "urgent",
          title: `Срочная проблема`,
          description: `${property.urgentMatter} - Квартира ${property.apartmentNumber}`,
          priority: "high",
          propertyId: property.id,
          tenantId: propertyTenant?.id,
        });
      }
    });

    // Check for payment days
    tenants.forEach((tenant) => {
      if (tenant.status === "current") {
        const paymentDate = new Date(tenant.receivePaymentDate);
        const nextPaymentDate = new Date(paymentDate);
        nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);
        
        // Check if payment is due today or tomorrow
        const daysUntilPayment = Math.ceil((nextPaymentDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysUntilPayment <= 1 && daysUntilPayment >= 0) {
          const property = properties.find(p => p.id === tenant.apartmentId);
          if (property) {
            notifications.push({
              id: `payment-${tenant.id}`,
              type: "payment",
              title: `День оплаты`,
              description: `${tenant.name} - Квартира ${property.apartmentNumber}`,
              daysRemaining: daysUntilPayment,
              isToday: daysUntilPayment === 0,
              priority: "medium",
              propertyId: property.id,
              tenantId: tenant.id,
            });
          }
        }
      }
    });

    // Sort by priority and days remaining
    return notifications.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      return (a.daysRemaining ?? 0) - (b.daysRemaining ?? 0);
    });
  };

  const notifications = getNotifications();

  if (notifications.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Ежедневные Уведомления
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Нет активных уведомлений</p>
            <p className="text-sm">Все в порядке!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200";
      case "medium":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "low":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "entry":
        return <Home className="h-4 w-4" />;
      case "urgent":
        return <AlertTriangle className="h-4 w-4" />;
      case "payment":
        return <DollarSign className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "entry":
        return "bg-green-100 text-green-800";
      case "urgent":
        return "bg-red-100 text-red-800";
      case "payment":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "entry":
        return "Заселение";
      case "urgent":
        return "Срочно";
      case "payment":
        return "Оплата";
      default:
        return "Уведомление";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
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
              className={`p-4 rounded-lg border ${getPriorityColor(notification.priority)}`}
            >
                             <div className="flex items-start justify-between">
                 <div className="flex items-start gap-3 flex-1">
                   <div className={`p-2 rounded-full ${getTypeColor(notification.type)}`}>
                     {getTypeIcon(notification.type)}
                   </div>
                   <div className="flex-1">
                     <div className="flex items-center gap-2 mb-1">
                       <Badge variant="outline" className={getTypeColor(notification.type)}>
                         {getTypeLabel(notification.type)}
                       </Badge>
                       {notification.daysRemaining !== undefined && (
                         <Badge 
                           variant={notification.isToday ? "destructive" : "secondary"}
                           className={notification.isToday ? "bg-red-600 text-white" : ""}
                         >
                           {notification.isToday ? "Сегодня" : `${notification.daysRemaining} дн.`}
                         </Badge>
                       )}
                     </div>
                     <h4 className="font-medium text-sm mb-1">{notification.title}</h4>
                     <p className="text-sm opacity-80">{notification.description}</p>
                   </div>
                 </div>
                 
                 {/* Action buttons */}
                 {notification.type === "urgent" && (
                   <Button
                     size="sm"
                     variant="outline"
                     onClick={() => updateProperty(notification.propertyId, { urgentMatterResolved: true })}
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
