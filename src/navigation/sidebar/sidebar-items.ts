import { Building2, Calendar, Users, type LucideIcon } from "lucide-react";

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
    label: "Управление Недвижимостью",
    items: [
      {
        title: "Недвижимость",
        url: "/dashboard/property-management/properties",
        icon: Building2,
      },
      {
        title: "Календарь",
        url: "/dashboard/property-management/calendar",
        icon: Calendar,
      },
      {
        title: "Арендаторы",
        url: "/dashboard/property-management/tenants",
        icon: Users,
      },
    ],
  },
];
