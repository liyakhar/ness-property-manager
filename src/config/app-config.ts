import packageJson from "../../package.json";

const currentYear = new Date().getFullYear();

export const APP_CONFIG = {
  name: "Ness Property Manager",
  version: packageJson.version,
  copyright: `© ${currentYear}, Ness Property Manager.`,
  meta: {
    title: "Ness Property Manager - Property Management Dashboard",
    description:
      "Ness Property Manager is a comprehensive property management dashboard built with Next.js 15, Tailwind CSS v4, and shadcn/ui. Perfect for managing properties, tenants, and occupancy tracking.",
  },
};
