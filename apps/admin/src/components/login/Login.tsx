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
  Text,
} from '@adminjs/design-system';

type LoginProps = {
  action?: string;
  errorMessage?: string | null;
};

const Login: React.FC<LoginProps> = ({ errorMessage }) => {
  const [events, setEvents] = useState<any[]>([]);
  const [selectedEvent, setEvent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [step, setStep] = useState<'email' | 'credentials'>('email');
  const [email, setEmail] = useState('');

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
      method="POST"
      as="form"
    >
      <H1>Login</H1>
      <section style={{ width: '400px' }}>
        {errorMessage && (
          <Text color="danger" mb="lg">
            {errorMessage}
          </Text>
        )}
        {step === 'email' ? (
          <>
            <FormGroup>
              <Label htmlFor="email">Account</Label>
              <Input
                id="email"
                type="text"
                variant="default"
                value={email}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                  setEmail(event.target.value)
                }
              />
              <Label htmlFor="event">Event</Label>
              <Select
                variant="default"
                options={events}
                value={selectedEvent}
                onChange={setEvent}
                isLoading={isLoading}
                isDisabled={isLoading || events.length === 0}
              />
            </FormGroup>
            <Button
              variant="primary"
              type="button"
              disabled={!email}
              onClick={() => setStep('credentials')}
            >
              Next
            </Button>
          </>
        ) : (
          <>
            <FormGroup action="login">
              <Input type="hidden" name="email" value={email} />
              <Input type="hidden" name="event" value={selectedEvent?.value} />
              <Label>Account</Label>
              <Text mb="default">{email}</Text>
              <Label htmlFor="password">Password</Label>
              <Input name="password" type="password" variant="default" />
              <Label htmlFor="totpToken">
                Authenticator code (if you&apos;ve enabled two-factor
                authentication)
              </Label>
              <Input name="totpToken" type="text" variant="default" />
            </FormGroup>
            <Button
              variant="text"
              type="button"
              mr="default"
              onClick={() => setStep('email')}
            >
              Back
            </Button>
            <Button variant="primary" type="submit">
              Login
            </Button>
          </>
        )}
      </section>
    </Box>
  );
};

export default Login;
