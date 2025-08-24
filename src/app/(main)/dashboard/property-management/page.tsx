"use client";

import Link from "next/link";

import { Building2, Calendar, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { usePropertyManagementStore } from "@/stores/property-management";

export default function PropertyManagementPage() {
  const { properties, tenants } = usePropertyManagementStore();

  const getActiveTenants = () => tenants.filter((tenant) => !tenant.exitDate);
  const getVacantProperties = () => {
    const occupiedPropertyIds = tenants.filter((tenant) => !tenant.exitDate).map((tenant) => tenant.apartmentId);
    return properties.filter((property) => !occupiedPropertyIds.includes(property.id));
  };

  return (
    <div className="@container/main flex flex-col gap-4 md:gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Управление Недвижимостью</h1>
        <p className="text-muted-foreground">
          Управляйте недвижимостью, отслеживайте занятость арендаторов и ведите базу данных недвижимости.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Всего Недвижимости</CardTitle>
            <Building2 className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{properties.length}</div>
            <p className="text-muted-foreground text-xs">
              {properties.filter((p) => p.readinessStatus === "FURNISHED").length} меблированная
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Всего Арендаторов</CardTitle>
            <Users className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tenants.length}</div>
            <p className="text-muted-foreground text-xs">{getActiveTenants().length} в настоящее время активны</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Занятая Недвижимость</CardTitle>
            <Building2 className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getActiveTenants().length}</div>
            <p className="text-muted-foreground text-xs">из {properties.length} общей недвижимости</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Свободная Недвижимость</CardTitle>
            <Building2 className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getVacantProperties().length}</div>
            <p className="text-muted-foreground text-xs">Доступна для новых арендаторов</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Недвижимость
            </CardTitle>
            <CardDescription>Управляйте всей недвижимостью и их текущим статусом</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-green-600">
                {properties.filter((p) => p.readinessStatus === "FURNISHED").length} Меблированная
              </Badge>
              <Badge variant="outline" className="text-orange-600">
                {properties.filter((p) => p.readinessStatus === "UNFURNISHED").length} Немеблированная
              </Badge>
            </div>
            <Button asChild className="w-full">
              <Link href="/dashboard/property-management/properties">
                <Building2 className="mr-2 h-4 w-4" />
                Управление Недвижимостью
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Календарь
            </CardTitle>
            <CardDescription>Визуальная временная шкала, показывающая периоды занятости арендаторов</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="text-muted-foreground text-sm">Просмотр занятости по всей недвижимости</div>
            <Button asChild className="w-full">
              <Link href="/dashboard/property-management/calendar">
                <Calendar className="mr-2 h-4 w-4" />
                Просмотр Календаря
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Арендаторы
            </CardTitle>
            <CardDescription>Управляйте записями арендаторов и их назначениями</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-blue-600">
                {getActiveTenants().length} Активные
              </Badge>
              <Badge variant="outline" className="text-gray-600">
                {tenants.filter((t) => t.exitDate).length} Неактивные
              </Badge>
            </div>
            <Button asChild className="w-full">
              <Link href="/dashboard/property-management/tenants">
                <Users className="mr-2 h-4 w-4" />
                Управление Арендаторами
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
