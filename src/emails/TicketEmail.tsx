import * as React from "react";
import { Html, Head, Body, Container, Heading, Text, Hr, Img, Section } from "@react-email/components";

export const TicketEmail = ({
  attendeeName,
  eventName,
  venue,
  startsAt,
  qrDataUrl,
}: {
  attendeeName: string;
  eventName: string;
  venue?: string | null;
  startsAt?: string | null;
  qrDataUrl: string;
}) => {
  return (
    <Html>
      <Head />
      <Body style={{ backgroundColor: "#f6f6f6", fontFamily: "ui-sans-serif, system-ui, -apple-system" }}>
        <Container style={{ backgroundColor: "#ffffff", padding: 24, maxWidth: 560, margin: "24px auto", borderRadius: 8 }}>
          <Heading style={{ margin: 0, fontSize: 24 }}>Your ticket for {eventName}</Heading>
          <Text style={{ marginTop: 8 }}>Hi {attendeeName},</Text>
          <Text style={{ marginTop: 8 }}>Show this QR code at the entrance. We look forward to seeing you!</Text>
          {startsAt ? <Text style={{ marginTop: 8 }}>When: {startsAt}</Text> : null}
          {venue ? <Text style={{ marginTop: 4 }}>Where: {venue}</Text> : null}
          <Hr style={{ margin: "16px 0" }} />
          <Section style={{ textAlign: "center" }}>
            <Img src={qrDataUrl} alt="Your ticket QR" width="200" height="200" />
          </Section>
          <Text style={{ color: "#6b7280", fontSize: 12, marginTop: 16 }}>La Rosa Vino</Text>
        </Container>
      </Body>
    </Html>
  );
};

export default TicketEmail;
