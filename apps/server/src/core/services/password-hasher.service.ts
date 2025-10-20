import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PasswordHasher {
  constructor(private readonly configService: ConfigService) {}

  async hash(plain: string): Promise<string> {
    const saltRounds = +this.configService.getOrThrow<number>('SALT_ROUNDS');
    return await bcrypt.hash(plain, saltRounds);
  }
  async compare(plain: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(plain, hash);
  }
}
