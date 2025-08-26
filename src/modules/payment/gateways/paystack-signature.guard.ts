import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class PaystackSignatureGuard implements CanActivate {
  constructor(private readonly cs: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const req: any = context.switchToHttp().getRequest();
    const signature = req.headers['x-paystack-signature'];
    const secret =
      this.cs.get('PAYSTACK_WEBHOOK_SECRET') ||
      this.cs.get('PAYSTACK_SECRET_KEY');

    if (!signature || !req.rawBody) {
      throw new UnauthorizedException('Missing signature or raw body');
    }

    const computed = crypto
      .createHmac('sha512', secret)
      .update(req.rawBody)
      .digest('hex');

    if (computed !== signature) {
      throw new UnauthorizedException('Invalid Paystack signature');
    }

    return true;
  }
}
