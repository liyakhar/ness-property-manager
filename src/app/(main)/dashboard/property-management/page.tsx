'use client';

import { AlertTriangle, Search } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { usePropertyManagementQuery } from '@/hooks/use-property-management-query';
import { DailyNotifications } from './_components/daily-notifications';

// Loading skeleton component
const PropertyManagementSkeleton = () => (
  <div className="@container/main flex flex-col gap-4 md:gap-6">
    <div className="flex flex-col gap-2">
      <Skeleton className="h-8 w-64" />
    </div>

    {/* Search Bar Skeleton */}
    <div className="relative">
      <Skeleton className="h-10 w-full" />
    </div>

    {/* Main Statistics Skeleton */}
    <div className="space-y-8">
      {/* Total Properties, Rent, and Sale */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-8 w-8" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-6 bg-muted/30 rounded-xl border">
                <Skeleton className="h-4 w-16 mb-2" />
                <Skeleton className="h-6 w-8 mb-3" />
                <div className="space-y-1">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
              <div className="p-6 bg-muted/30 rounded-xl border">
                <Skeleton className="h-4 w-16 mb-2" />
                <Skeleton className="h-6 w-8 mb-3" />
                <div className="space-y-1">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-8 w-8" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-6 bg-muted/30 rounded-xl border">
                <Skeleton className="h-4 w-16 mb-2" />
                <Skeleton className="h-6 w-8 mb-3" />
                <div className="space-y-1">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
              <div className="p-6 bg-muted/30 rounded-xl border">
                <Skeleton className="h-4 w-16 mb-2" />
                <Skeleton className="h-6 w-8 mb-3" />
                <div className="space-y-1">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tenants and Room Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-8 w-8" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {Array.from({ length: 4 }, (_, i) => (
                <div
                  key={`tenant-skeleton-${Date.now()}-${i}`}
                  className="p-6 bg-muted/30 rounded-xl border"
                >
                  <Skeleton className="h-6 w-8 mb-1" />
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-8 w-8" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {Array.from({ length: 4 }, (_, i) => (
                <div
                  key={`room-skeleton-${Date.now()}-${i}`}
                  className="p-6 bg-muted/30 rounded-xl border"
                >
                  <Skeleton className="h-6 w-8 mb-1" />
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
);

export default function PropertyManagementPage() {
  const { properties, tenants, updateProperty, isLoading } = usePropertyManagementQuery();
  const [searchQuery, setSearchQuery] = useState('');

  // Filter properties and tenants based on search query
  const filteredProperties = properties.filter(
    (property) =>
      !searchQuery ||
      property.apartmentNumber.toString().includes(searchQuery) ||
      property.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.readinessStatus.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.propertyType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.occupancyStatus.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (searchQuery.toLowerCase().includes('аренд') && property.propertyType === 'аренда') ||
      (searchQuery.toLowerCase().includes('продаж') && property.propertyType === 'продажа') ||
      (searchQuery.toLowerCase().includes('занят') && property.occupancyStatus === 'занята') ||
      (searchQuery.toLowerCase().includes('свобод') && property.occupancyStatus === 'свободна')
  );

  const filteredTenants = tenants.filter((tenant) => {
    if (!searchQuery) return true;

    const query = searchQuery.toLowerCase();

    // Basic text search
    const basicMatch =
      tenant.name.toLowerCase().includes(query) || tenant.apartmentId.toLowerCase().includes(query);

    if (basicMatch) return true;

    // Date search
    if (isDateMatch(tenant.entryDate, query)) return true;
    if (tenant.exitDate && isDateMatch(tenant.exitDate, query)) return true;

    // Search by property details - find the property and check its details
    const property = properties.find((p) => p.id === tenant.apartmentId);
    if (property) {
      // Check apartment number
      if (property.apartmentNumber.toString().includes(query)) {
        return true;
      }

      // Check property location/address
      if (property.location.toLowerCase().includes(query)) {
        return true;
      }

      // Check property readiness status
      if (property.readinessStatus.toLowerCase().includes(query)) {
        return true;
      }

      // Check property rooms
      if (property.rooms.toString().includes(query)) {
        return true;
      }

      // Check urgent matters
      if (property.urgentMatter?.toLowerCase().includes(query)) {
        return true;
      }
    }

    return false;
  });

  // Helper function to check if query matches date formats
  const isDateMatch = (date: Date, searchQuery: string) => {
    const query = searchQuery.toLowerCase();

    // Check various date formats
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString();

    // Format: DD/MM (e.g., "01/02")
    if (query.includes('/') && query.length === 5) {
      const [dayPart, monthPart] = query.split('/');
      if (day === dayPart && month === monthPart) return true;
    }

    // Format: DD/MM/YYYY (e.g., "01/02/2024")
    if (query.includes('/') && query.length === 10) {
      const [dayPart, monthPart, yearPart] = query.split('/');
      if (day === dayPart && month === monthPart && year === yearPart) return true;
    }

    // Format: MM/DD (e.g., "02/01")
    if (query.includes('/') && query.length === 5) {
      const [monthPart, dayPart] = query.split('/');
      if (day === dayPart && month === monthPart) return true;
    }

    // Format: MM/DD/YYYY (e.g., "02/01/2024")
    if (query.includes('/') && query.length === 10) {
      const [monthPart, dayPart, yearPart] = query.split('/');
      if (day === dayPart && month === monthPart && year === yearPart) return true;
    }

    // Check individual components
    if (day.includes(query) || month.includes(query) || year.includes(query)) return true;

    // Check date string representation
    if (date.toDateString().toLowerCase().includes(query)) return true;

    return false;
  };

  // Calculate statistics for mind map structure
  const _totalProperties = filteredProperties.length;
  const rentProperties = filteredProperties.filter((p) => p.propertyType === 'аренда');
  const saleProperties = filteredProperties.filter((p) => p.propertyType === 'продажа');

  // Rent properties breakdown
  const rentOccupied = rentProperties.filter((p) => p.occupancyStatus === 'занята');
  const rentVacant = rentProperties.filter((p) => p.occupancyStatus === 'свободна');

  const rentOccupiedFurnished = rentOccupied.filter((p) => p.readinessStatus === 'меблированная');
  const rentOccupiedUnfurnished = rentOccupied.filter(
    (p) => p.readinessStatus === 'немеблированная'
  );
  const rentVacantFurnished = rentVacant.filter((p) => p.readinessStatus === 'меблированная');
  const rentVacantUnfurnished = rentVacant.filter((p) => p.readinessStatus === 'немеблированная');

  // Sale properties breakdown
  const saleOccupied = saleProperties.filter((p) => p.occupancyStatus === 'занята');
  const saleVacant = saleProperties.filter((p) => p.occupancyStatus === 'свободна');

  const saleOccupiedFurnished = saleOccupied.filter((p) => p.readinessStatus === 'меблированная');
  const saleOccupiedUnfurnished = saleOccupied.filter(
    (p) => p.readinessStatus === 'немеблированная'
  );
  const saleVacantFurnished = saleVacant.filter((p) => p.readinessStatus === 'меблированная');
  const saleVacantUnfurnished = saleVacant.filter((p) => p.readinessStatus === 'немеблированная');

  // Additional important metrics
  const urgentMatters = filteredProperties.filter(
    (p) =>
      p.urgentMatter &&
      !p.urgentMatterResolved &&
      typeof p.urgentMatter === 'string' &&
      p.urgentMatter.trim() !== ''
  );
  const propertiesWithUrgentMatters = urgentMatters.length;

  // Room distribution
  const oneRoomProperties = filteredProperties.filter((p) => p.rooms === 1);
  const twoRoomProperties = filteredProperties.filter((p) => p.rooms === 2);
  const threeRoomProperties = filteredProperties.filter((p) => p.rooms === 3);
  const fourPlusRoomProperties = filteredProperties.filter((p) => p.rooms >= 4);

  // Revenue potential indicators
  const readyForImmediateRent = rentVacantFurnished.length; // Highest revenue potential
  const readyForImmediateSale = saleVacantFurnished.length;
  const _totalReadyForImmediateAction = readyForImmediateRent + readyForImmediateSale;

  // Tenant status breakdown
  const currentTenants = filteredTenants.filter((t) => t.status === 'current');
  const pastTenants = filteredTenants.filter((t) => t.status === 'past');
  const futureTenants = filteredTenants.filter((t) => t.status === 'future');
  const upcomingTenants = filteredTenants.filter((t) => t.status === 'upcoming');

  // Address-based grouping
  const addressGroups = filteredProperties.reduce(
    (groups, property) => {
      const address = property.location;
      if (!groups[address]) {
        groups[address] = {
          address,
          count: 0,
          rent: 0,
          sale: 0,
          occupied: 0,
          vacant: 0,
          furnished: 0,
          unfurnished: 0,
        };
      }

      groups[address].count++;

      if (property.propertyType === 'аренда') {
        groups[address].rent++;
      } else {
        groups[address].sale++;
      }

      if (property.occupancyStatus === 'занята') {
        groups[address].occupied++;
      } else {
        groups[address].vacant++;
      }

      if (property.readinessStatus === 'меблированная') {
        groups[address].furnished++;
      } else {
        groups[address].unfurnished++;
      }

      return groups;
    },
    {} as Record<
      string,
      {
        address: string;
        count: number;
        rent: number;
        sale: number;
        occupied: number;
        vacant: number;
        furnished: number;
        unfurnished: number;
      }
    >
  );

  // Sort addresses by property count (descending)
  const sortedAddresses = Object.values(addressGroups).sort((a, b) => b.count - a.count);

  if (isLoading) {
    return <PropertyManagementSkeleton />;
  }

  return (
    <div className="@container/main flex flex-col gap-4 md:gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Общие Показатели</h1>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Поиск по недвижимости, арендаторам, номерам квартир..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Main Statistics - Mind Map Structure */}
      <div className="space-y-8">
        {/* Total Properties, Rent, and Sale - All in One Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Rent Properties Branch */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-base">
                <span>Для Аренды</span>
                <div className="text-2xl font-bold">{rentProperties.length}</div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {/* Occupied */}
                <div className="p-6 bg-muted/30 rounded-xl border">
                  <div className="text-sm font-medium mb-2">Занята</div>
                  <div className="text-xl font-bold mb-3">{rentOccupied.length}</div>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span>Готовая:</span>
                      <span className="font-medium">{rentOccupiedFurnished.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Не готовая:</span>
                      <span className="font-medium">{rentOccupiedUnfurnished.length}</span>
                    </div>
                  </div>
                </div>

                {/* Vacant */}
                <div className="p-6 bg-muted/30 rounded-xl border">
                  <div className="text-sm font-medium mb-2">Свободна</div>
                  <div className="text-xl font-bold mb-3">{rentVacant.length}</div>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span>Готовая:</span>
                      <span className="font-medium">{rentVacantFurnished.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Не готовая:</span>
                      <span className="font-medium">{rentVacantUnfurnished.length}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sale Properties Branch */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-base">
                <span>Для Продажи</span>
                <div className="text-2xl font-bold">{saleProperties.length}</div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {/* Occupied / Sold */}
                <div className="p-6 bg-muted/30 rounded-xl border">
                  <div className="text-sm font-medium mb-2">Продана</div>
                  <div className="text-xl font-bold mb-3">{saleOccupied.length}</div>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span>Готовая:</span>
                      <span className="font-medium">{saleOccupiedFurnished.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Не готовая:</span>
                      <span className="font-medium">{saleOccupiedUnfurnished.length}</span>
                    </div>
                  </div>
                </div>

                {/* Vacant */}
                <div className="p-6 bg-muted/30 rounded-xl border">
                  <div className="text-sm font-medium mb-2">Свободна</div>
                  <div className="text-xl font-bold mb-3">{saleVacant.length}</div>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span>Готовая:</span>
                      <span className="font-medium">{saleVacantFurnished.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Не готовая:</span>
                      <span className="font-medium">{saleVacantUnfurnished.length}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tenants and Room Distribution - Side by Side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Tenants */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-base">
                <span>Арендаторы</span>
                <div className="text-2xl font-bold">{filteredTenants.length}</div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-6 bg-muted/30 rounded-xl border text-left">
                  <div className="text-xl font-bold mb-1">{currentTenants.length}</div>
                  <div className="text-sm text-muted-foreground">текущие</div>
                </div>
                <div className="p-6 bg-muted/30 rounded-xl border text-left">
                  <div className="text-xl font-bold mb-1">{upcomingTenants.length}</div>
                  <div className="text-sm text-muted-foreground">предстоящие</div>
                </div>
                <div className="p-6 bg-muted/30 rounded-xl border text-left">
                  <div className="text-xl font-bold mb-1">{pastTenants.length}</div>
                  <div className="text-sm text-muted-foreground">прошлые</div>
                </div>
                <div className="p-6 bg-muted/30 rounded-xl border text-left">
                  <div className="text-xl font-bold mb-1">{futureTenants.length}</div>
                  <div className="text-sm text-muted-foreground">будущие</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Room Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-base">
                <span>Распределение по комнатам</span>
                <div className="text-2xl font-bold invisible">0</div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-6 bg-muted/30 rounded-xl border text-left">
                  <div className="text-xl font-bold mb-1">{oneRoomProperties.length}</div>
                  <div className="text-sm text-muted-foreground">1 комната</div>
                </div>
                <div className="p-6 bg-muted/30 rounded-xl border text-left">
                  <div className="text-xl font-bold mb-1">{twoRoomProperties.length}</div>
                  <div className="text-sm text-muted-foreground">2 комнаты</div>
                </div>
                <div className="p-6 bg-muted/30 rounded-xl border text-left">
                  <div className="text-xl font-bold mb-1">{threeRoomProperties.length}</div>
                  <div className="text-sm text-muted-foreground">3 комнаты</div>
                </div>
                <div className="p-6 bg-muted/30 rounded-xl border text-left">
                  <div className="text-xl font-bold mb-1">{fourPlusRoomProperties.length}</div>
                  <div className="text-sm text-muted-foreground">4+ комнаты</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Address Distribution - On its own line below */}
        <div className="grid grid-cols-1 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">По адресам</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {sortedAddresses.map((addressGroup) => (
                  <div
                    key={addressGroup.address}
                    className="flex items-center justify-between p-4 bg-muted/30 rounded-xl border"
                  >
                    <div className="font-medium">{addressGroup.address}</div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="font-bold">{addressGroup.count}</span>
                      <span className="text-muted-foreground">|</span>
                      <span className="text-orange-600">{addressGroup.vacant} свободно</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Metrics */}
        <div className="grid grid-cols-1 gap-6">
          {/* Urgent Matters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                Срочные вопросы
              </CardTitle>
            </CardHeader>
            <CardContent>
              {propertiesWithUrgentMatters > 0 ? (
                <div className="space-y-3">
                  {urgentMatters.slice(0, 3).map((property) => (
                    <div
                      key={property.id}
                      className="p-4 rounded-lg border bg-card border-l-4 border-l-destructive"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="mb-2">
                            <span className="font-medium text-card-foreground">
                              Кв. {property.apartmentNumber}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">{property.urgentMatter}</p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            updateProperty({
                              id: property.id,
                              updates: { urgentMatterResolved: true },
                            })
                          }
                        >
                          Решено
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground">
                  <p>Срочных вопросов нет</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Daily Notifications */}
      <DailyNotifications />
    </div>
  );
}
