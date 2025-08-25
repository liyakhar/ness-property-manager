import packageJson from "../../package.json";

const currentYear = new Date().getFullYear();

export const APP_CONFIG = {
  name: "Ness Property Management",
  version: packageJson.version,
  copyright: `© ${currentYear}, Ness Property Management.`,
  meta: {
    title: "Ness Property Management - Панель Управления",
    description:
      "Ness Property Management - это комплексная панель управления недвижимостью, построенная на Next.js 15, Tailwind CSS v4 и shadcn/ui. Идеально подходит для управления недвижимостью, арендаторами и отслеживания занятости.",
  },
};
