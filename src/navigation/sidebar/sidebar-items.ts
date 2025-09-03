import { Building2, Calendar, Users, Home, Bell, type LucideIcon } from "lucide-react";

export interface NavSubItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  comingSoon?: boolean;
  newTab?: boolean;
  isNew?: boolean;
}

export interface NavMainItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  subItems?: NavSubItem[];
  comingSoon?: boolean;
  newTab?: boolean;
}

export interface NavGroup {
  id: number;
  label?: string;
  items: NavMainItem[];
}

export const sidebarItems: NavGroup[] = [
  {
    id: 1,
    items: [
      {
        title: "Общие Показатели",
        url: "/dashboard/property-management",
        icon: Home,
      },
      {
        title: "Недвижимость",
        url: "/dashboard/property-management/properties",
        icon: Building2,
      },
      {
        title: "Арендаторы",
        url: "/dashboard/property-management/tenants",
        icon: Users,
      },
      {
        title: "Календарь",
        url: "/dashboard/property-management/calendar",
        icon: Calendar,
      },
      {
        title: "Обновления",
        url: "/dashboard/updates",
        icon: Bell,
      },
    ],
  },
];
