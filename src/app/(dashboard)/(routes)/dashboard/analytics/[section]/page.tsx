import { notFound } from "next/navigation";
import AdminAnalyticsDashboard from "../../_components/AdminAnalyticsDashboard";

const sectionToTab = {
  students: "students",
  packages: "packages",
  questions: "questions",
  security: "monitoring",
} as const;

type Section = keyof typeof sectionToTab;

export function generateStaticParams() {
  return Object.keys(sectionToTab).map((section) => ({ section }));
}

export default function AnalyticsSectionPage({
  params,
}: {
  params: { section: string };
}) {
  const tab = sectionToTab[params.section as Section];

  if (!tab) {
    notFound();
  }

  return <AdminAnalyticsDashboard initialTab={tab} />;
}
