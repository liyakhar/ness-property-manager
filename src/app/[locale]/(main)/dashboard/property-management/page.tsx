"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

import { Building2, Calendar, Users } from "lucide-react";
import { useTranslations } from "next-intl";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { usePropertyManagementStore } from "@/stores/property-management";

export default function PropertyManagementPage() {
  const t = useTranslations("propertyManagement");
  const params = useParams();
  const locale = params.locale as string;

  const { properties, tenants } = usePropertyManagementStore();

  const getActiveTenants = () => tenants.filter((tenant) => !tenant.exitDate);
  const getVacantProperties = () => {
    const occupiedPropertyIds = tenants.filter((tenant) => !tenant.exitDate).map((tenant) => tenant.apartmentId);
    return properties.filter((property) => !occupiedPropertyIds.includes(property.id));
  };

  return (
    <div className="@container/main flex flex-col gap-4 md:gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">{t("description")}</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("overview.totalProperties")}</CardTitle>
            <Building2 className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{properties.length}</div>
            <p className="text-muted-foreground text-xs">
              {properties.filter((p) => p.readinessStatus === "FURNISHED").length} {t("properties.furnishedCount")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("overview.totalTenants")}</CardTitle>
            <Users className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tenants.length}</div>
            <p className="text-muted-foreground text-xs">
              {getActiveTenants().length} {t("tenants.currentlyActive")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("overview.occupiedProperties")}</CardTitle>
            <Building2 className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getActiveTenants().length}</div>
            <p className="text-muted-foreground text-xs">of {properties.length} total properties</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("overview.vacantProperties")}</CardTitle>
            <Building2 className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getVacantProperties().length}</div>
            <p className="text-muted-foreground text-xs">{t("properties.availableForNewTenants")}</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              {t("properties.title")}
            </CardTitle>
            <CardDescription>{t("properties.description")}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-green-600">
                {properties.filter((p) => p.readinessStatus === "FURNISHED").length} {t("properties.furnished")}
              </Badge>
              <Badge variant="outline" className="text-orange-600">
                {properties.filter((p) => p.readinessStatus === "UNFURNISHED").length} {t("properties.unfurnished")}
              </Badge>
            </div>
            <Button asChild className="w-full">
              <Link href={`/${locale}/dashboard/property-management/properties`}>
                <Building2 className="mr-2 h-4 w-4" />
                {t("overview.manageProperties")}
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              {t("calendar.title")}
            </CardTitle>
            <CardDescription>{t("calendar.description")}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="text-muted-foreground text-sm">{t("overview.viewCalendar")}</div>
            <Button asChild className="w-full">
              <Link href={`/${locale}/dashboard/property-management/calendar`}>
                <Calendar className="mr-2 h-4 w-4" />
                {t("calendar.viewCalendar")}
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              {t("tenants.title")}
            </CardTitle>
            <CardDescription>{t("tenants.description")}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-blue-600">
                {getActiveTenants().length} {t("tenants.active")}
              </Badge>
              <Badge variant="outline" className="text-gray-600">
                {tenants.filter((t) => t.exitDate).length} {t("tenants.inactive")}
              </Badge>
            </div>
            <Button asChild className="w-full">
              <Link href={`/${locale}/dashboard/property-management/tenants`}>
                <Users className="mr-2 h-4 w-4" />
                {t("overview.manageTenants")}
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
