"use client";

import { DatePicker, Form, SelectableCardGroup, Section, Wizard } from "@/components/composer";
import styles from "./compositions.module.css";

export default function BookingFlow({
  eyebrow = "Booking",
  title = "Choose a service and time",
  description,
  services = [],
  times = [],
  id = "booking-flow",
}) {
  const titleId = `${id}-title`;
  const steps = [
    {
      id: "service",
      title: "Service",
      description: "Choose an appointment",
      content: <SelectableCardGroup className={styles.selectionGroup} label="Available services" items={services} defaultValue="" required />,
    },
    {
      id: "schedule",
      title: "Schedule",
      description: "Choose a date and time",
      content: (
        <Section as="div" className={styles.bookingSchedule}>
          <DatePicker label="Appointment date" min={new Date()} required />
          <SelectableCardGroup className={styles.selectionGroup} label="Available times" items={times} defaultValue="" required />
        </Section>
      ),
    },
    {
      id: "details",
      title: "Details",
      description: "Tell us how to reach you",
      content: <Form className={styles.flowForm} fields={[
        { type: "text", name: "name", label: "Name", required: true },
        { type: "email", name: "email", label: "Email address", required: true },
      ]} submitLabel="Save details" onSubmit={async () => ({ message: "Details saved." })} />,
    },
  ];
  return (
    <Section as="section" className={styles.section} aria-labelledby={titleId}>
      <Section as="header" className={styles.intro}>
        <p className={styles.eyebrow}>{eyebrow}</p>
        <h2 id={titleId}>{title}</h2>
        {description ? <p>{description}</p> : null}
      </Section>
      <Wizard className={styles.wizard} steps={steps} completeLabel="Confirm booking" />
    </Section>
  );
}
