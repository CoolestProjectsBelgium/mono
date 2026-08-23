// src/frontend/login.tsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Input,
  Label,
  H1,
  Select,
  FormGroup,
} from "@adminjs/design-system";

const Login = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [selectedEvent, setEvent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch('/api/events');
        const data = await response.json();
        setEvents(data);
        // Pre-select current event if available
        const currentEvent = data.find((e: any) => e.isCurrent);
        setEvent(currentEvent || data[0]);
      } catch (error) {
        console.error('Failed to fetch events:', error);
        setEvents([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEvents();
  }, []);

  return (
    <Box
      margin="auto"
      height="100vh"
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      method="POST" as="form"
    >
      <H1>Login</H1>
      <section style={{ width: "400px" }}>
        <FormGroup action="login" >
          <Label htmlFor="email">Account</Label>
          <Input name="email" type="text" variant="default" />
          <Label htmlFor="password">Password</Label>
          <Input name="password" type="password" variant="default" />
          <Label htmlFor="event">Event</Label>
          <Input type="hidden" name="event" value={selectedEvent?.value} />
          <Select 
            variant="default" 
            options={events} 
            value={selectedEvent} 
            onChange={setEvent}
            isLoading={isLoading}
            isDisabled={isLoading || events.length === 0}
          />
        </FormGroup>
        <Button variant="primary" type="submit">Login</Button>
      </section>
    </Box>
  );
};

export default Login;
