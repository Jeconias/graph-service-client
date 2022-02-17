import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(str?: string): string {
    return str ?? 'Hello World!';
  }
}
