import React, { useEffect, useState } from 'react';
import { ApiClient } from 'adminjs';
import type { ActionProps } from 'adminjs';
import { Box, Button, H2, Input, Label, Text } from '@adminjs/design-system';

const api = new ApiClient();

type SetupResponse = {
  qrCode?: string;
  secret?: string;
  notice?: { message: string; type: 'success' | 'error' };
};

const TwoFactorSetup: React.FC<ActionProps> = ({ record, resource }) => {
  const recordId = record?.id;
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{
    text: string;
    type: 'success' | 'error';
  } | null>(null);
  const [enabled, setEnabled] = useState(
    Boolean(record?.params?.twoFactorEnabled),
  );

  useEffect(() => {
    const loadSecret = async () => {
      if (!recordId) {
        return;
      }
      setLoading(true);
      try {
        const response = await api.recordAction({
          resourceId: resource.id,
          recordId,
          actionName: 'twoFactorSetup',
          method: 'get',
        });
        const data = response.data as SetupResponse;
        setQrCode(data.qrCode ?? null);
        setSecret(data.secret ?? null);
      } catch (err) {
        console.error('Failed to start two-factor setup:', err);
        setMessage({
          text: 'Unable to start setup. Please retry.',
          type: 'error',
        });
      } finally {
        setLoading(false);
      }
    };
    loadSecret();
  }, [recordId, resource.id]);

  const confirmCode = async () => {
    if (!recordId) {
      return;
    }
    try {
      const response = await api.recordAction({
        resourceId: resource.id,
        recordId,
        actionName: 'twoFactorSetup',
        method: 'post',
        data: { code },
      });
      const data = response.data as SetupResponse;
      if (data.notice?.type === 'success') {
        setEnabled(true);
      }
      setMessage(
        data.notice
          ? { text: data.notice.message, type: data.notice.type }
          : null,
      );
    } catch (err) {
      console.error('Failed to confirm two-factor code:', err);
      setMessage({
        text: 'Unable to confirm the code. Please retry.',
        type: 'error',
      });
    }
  };

  if (enabled) {
    return (
      <Box variant="grey">
        <H2>Two-factor authentication</H2>
        <Text>Two-factor authentication is enabled for this account.</Text>
      </Box>
    );
  }

  return (
    <Box variant="grey">
      <H2>Set up two-factor authentication</H2>
      <Text mb="lg">
        Scan this QR code with an authenticator app (e.g. Google Authenticator),
        then enter the 6-digit code it shows to confirm.
      </Text>
      {loading && <Text>Generating your secret...</Text>}
      {qrCode && (
        <Box mb="lg">
          <img
            src={qrCode}
            alt="Two-factor authentication QR code"
            width={200}
            height={200}
          />
        </Box>
      )}
      {secret && (
        <Text mb="lg">
          Can&apos;t scan it? Enter this key manually: <code>{secret}</code>
        </Text>
      )}
      <Label htmlFor="code">Authenticator code</Label>
      <Input
        id="code"
        name="code"
        value={code}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
          setCode(event.target.value)
        }
      />
      {message && (
        <Text
          color={message.type === 'error' ? 'danger' : 'success'}
          mt="default"
        >
          {message.text}
        </Text>
      )}
      <Button mt="lg" variant="primary" onClick={confirmCode}>
        Confirm
      </Button>
    </Box>
  );
};

export default TwoFactorSetup;
