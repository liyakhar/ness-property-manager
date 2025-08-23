import { redirect } from "next/navigation";

export default function Home() {
  redirect("/dashboard/property-management/properties");
  return <>Coming Soon</>;
}
