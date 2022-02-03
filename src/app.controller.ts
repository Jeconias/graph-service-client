import { Controller, Get, Query } from '@nestjs/common';
import { AppService } from './app.service';
import GrpcService from './grpc/GrpcClient';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly grpcClient: GrpcService,
  ) {}

  @Get()
  getHello(@Query() queryString): string {
    const { to } = queryString ?? { to: 'B' };

    const graphSubscribe = this.grpcClient.register({
      to,
      infos: {
        url: 'http://other.service.com',
        date: Date.now() / 1000, //Convert to seconds
      },
    });

    graphSubscribe.subscribe({
      complete: () => console.log('GRPC call is finished'),
      next: ({ data }) => console.log(data),
      error: (err) => {
        if (err) console.log('GRPC call has a error: ', err);
      },
    });

    return this.appService.getHello();
  }
}
