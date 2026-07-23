"use client";

import { ChartFrame, DataTable, Section } from "@/components/composer";
import styles from "./compositions.module.css";

const columns = [
  { id: "name", header: "Item", accessor: "name", sortable: true },
  { id: "status", header: "Status", accessor: "status", sortable: true },
  { id: "value", header: "Value", accessor: "value", sortable: true, align: "end" },
];

export default function DashboardOverview({
  eyebrow = "Overview",
  title = "Dashboard",
  description,
  metrics = [],
  chart = [],
  rows = [],
  id = "dashboard",
}) {
  const titleId = `${id}-title`;
  const maximum = Math.max(...chart.map((item) => item.value), 1);
  return (
    <Section as="section" className={styles.section} aria-labelledby={titleId}>
      <Section as="header" className={styles.intro}>
        <p className={styles.eyebrow}>{eyebrow}</p>
        <h2 id={titleId}>{title}</h2>
        {description ? <p>{description}</p> : null}
      </Section>
      <dl className={styles.dashboardMetrics}>
        {metrics.map((metric) => <div key={metric.label}><dt>{metric.label}</dt><dd>{metric.value}<small>{metric.change}</small></dd></div>)}
      </dl>
      <Section as="div" className={styles.dashboardGrid}>
        <ChartFrame className={styles.chartFrame} title="Activity" description="Recent volume by period" summary="A visual placeholder for the project-owned chart implementation.">
          <Section as="div" className={styles.barChart} aria-hidden="true">
            {chart.map((item) => <span key={item.label} style={{ "--bar-size": `${Math.round((item.value / maximum) * 100)}%` }}><i /><small>{item.label}</small></span>)}
          </Section>
        </ChartFrame>
        <DataTable className={styles.dataTable} rows={rows} columns={columns} caption="Recent items" defaultSort={{ columnId: "name", direction: "ascending" }} />
      </Section>
    </Section>
  );
}
