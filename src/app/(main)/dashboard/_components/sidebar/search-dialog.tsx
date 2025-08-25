"use client";
import * as React from "react";
import { useRouter } from "next/navigation";

import { Building2, Calendar, Users, Search, Home } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CommandDialog, CommandEmpty, CommandInput, CommandItem, CommandList, CommandGroup } from "@/components/ui/command";
import { usePropertyManagementStore } from "@/stores/property-management";

interface SearchItem {
  id: string;
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  group: string;
  keywords: string[];
}

export function SearchDialog() {
  const [open, setOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const router = useRouter();
  const { properties, tenants } = usePropertyManagementStore();

  // Create search items from navigation and data
  const searchItems: SearchItem[] = [
    // Navigation items
    {
      id: "dashboard",
      title: "Общие Показатели",
      url: "/dashboard/property-management",
      icon: Home,
      group: "Навигация",
      keywords: ["dashboard", "общие", "показатели", "home", "main", "главная", "панель"]
    },
    {
      id: "properties",
      title: "Недвижимость",
      url: "/dashboard/property-management/properties",
      icon: Building2,
      group: "Навигация",
      keywords: ["properties", "недвижимость", "buildings", "apartments", "units", "квартиры"]
    },
    {
      id: "calendar",
      title: "Календарь",
      url: "/dashboard/property-management/calendar",
      icon: Calendar,
      group: "Навигация",
      keywords: ["calendar", "календарь", "занятость", "occupancy", "schedule", "временная шкала"]
    },
    {
      id: "tenants",
      title: "Арендаторы",
      url: "/dashboard/property-management/tenants",
      icon: Users,
      group: "Навигация",
      keywords: ["tenants", "арендаторы", "renters", "residents", "жильцы"]
    },
    // Properties
    ...properties.map(property => ({
      id: `prop-${property.id}`,
      title: `Квартира #${property.apartmentNumber}`,
      url: `/dashboard/property-management/properties`,
      icon: Building2,
      group: "Недвижимость",
      keywords: [
        `apartment ${property.apartmentNumber}`,
        `квартира ${property.apartmentNumber}`,
        property.apartmentNumber.toString(),
        property.location.toLowerCase(),
        property.readinessStatus.toLowerCase(),
        property.propertyType.toLowerCase(),
        property.occupancyStatus.toLowerCase(),
        property.propertyType === "аренда" ? "аренда" : "продажа",
        property.propertyType === "аренда" ? "rent" : "sale",
        property.occupancyStatus === "занята" ? "занята" : "свободна",
        property.occupancyStatus === "занята" ? "occupied" : "vacant",
        property.rooms.toString(),
        property.urgentMatter?.toLowerCase() ?? ""
      ].filter(Boolean)
    })),
    // Tenants
    ...tenants.map(tenant => {
      const property = properties.find(p => p.id === tenant.apartmentId);
      return {
        id: `tenant-${tenant.id}`,
        title: tenant.name,
        url: `/dashboard/property-management/tenants`,
        icon: Users,
        group: "Арендаторы",
        keywords: [
          tenant.name.toLowerCase(),
          tenant.notes?.toLowerCase() ?? "",
          tenant.apartmentId.toLowerCase(),
          property ? property.apartmentNumber.toString() : "",
          property ? `квартира ${property.apartmentNumber}` : "",
          property ? `apartment ${property.apartmentNumber}` : ""
        ].filter(Boolean)
      };
    })
  ];

  // Filter search items based on query
  const filteredItems = searchItems.filter(item => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return item.keywords.some(keyword => keyword.includes(query)) || 
           item.title.toLowerCase().includes(query) ||
           item.group.toLowerCase().includes(query);
  });

  // Group items by category
  const groupedItems = filteredItems.reduce((acc, item) => {
    if (!(item.group in acc)) {
      acc[item.group] = [];
    }
    acc[item.group].push(item);
    return acc;
  }, {} as Record<string, SearchItem[]>);

  const handleSelect = (item: SearchItem) => {
    router.push(item.url);
    setOpen(false);
    setSearchQuery("");
  };

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <>
      <Button
        variant="outline"
        className="text-muted-foreground relative h-9 w-full justify-start rounded-[0.5rem] text-sm sm:pr-12 md:w-40 lg:w-64"
        onClick={() => setOpen(true)}
      >
        <Search className="mr-2 h-4 w-4" />
        <span className="inline-flex">Поиск...</span>
        <kbd className="bg-muted pointer-events-none absolute top-[0.3rem] right-[0.3rem] hidden h-5 items-center gap-1 rounded border px-1.5 font-mono text-[10px] font-medium opacity-100 select-none sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput 
          placeholder="Поиск по недвижимости, арендаторам, страницам..." 
          value={searchQuery}
          onValueChange={setSearchQuery}
        />
        <CommandList>
          <CommandEmpty>Результаты не найдены.</CommandEmpty>
          {Object.entries(groupedItems).map(([group, items]) => (
            <CommandGroup key={group} heading={group}>
              {items.map((item) => (
                <CommandItem 
                  key={item.id} 
                  onSelect={() => handleSelect(item)}
                  className="cursor-pointer"
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  <span>{item.title}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          ))}
        </CommandList>
      </CommandDialog>
    </>
  );
}
