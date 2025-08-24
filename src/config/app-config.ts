import packageJson from "../../package.json";

const currentYear = new Date().getFullYear();

export const APP_CONFIG = {
  name: "Ness Управление Недвижимостью",
  version: packageJson.version,
  copyright: `© ${currentYear}, Ness Управление Недвижимостью.`,
  meta: {
    title: "Ness Управление Недвижимостью - Панель Управления",
    description:
      "Ness Управление Недвижимостью - это комплексная панель управления недвижимостью, построенная на Next.js 15, Tailwind CSS v4 и shadcn/ui. Идеально подходит для управления недвижимостью, арендаторами и отслеживания занятости.",
  },
};
