import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import * as crypto from 'crypto';
import { Strategy } from 'passport-custom';

function verifySignature(secret: string, signature: string, path: string, expiry: Date): boolean {
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(`${path}:${expiry.getTime()}`);
  const expectedSignature = hmac.digest('hex');
  return expectedSignature === signature;
}

function generateSignature(secret: string, path: string, expiry: Date): string {
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(`${path}:${expiry.getTime()}`);
  return hmac.digest('hex');
}

@Injectable()
export class FileSignatureStrategy extends PassportStrategy(Strategy, 'filesign') {
  validate(req: any) {

    const sig = req.headers['x-sig'];
    const exp = Number(req.headers['x-exp']);
    const path = req.headers['x-original-uri'];
    const apacheSecret = req.headers['x-apache-secret'];

    if (apacheSecret !== process.env.APACHE_SECRET) {
      throw new UnauthorizedException('Invalid Apache secret');
    }

    if (!sig || !exp || !path) {
      throw new UnauthorizedException('Missing headers');
    }

    if (Date.now() > exp) {
      throw new UnauthorizedException('Signature expired');
    }
    
    if (!verifySignature(process.env.FILE_SIGN_SECRET!, sig, path, new Date(exp))) {
      throw new UnauthorizedException('Invalid signature');
    }

    return { ok: true, path };
  }
}