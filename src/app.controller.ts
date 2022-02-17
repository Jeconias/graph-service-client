import { Controller, Get, Query } from '@nestjs/common';
import { createReadStream } from 'fs';
import { ReplaySubject } from 'rxjs';
import { AppService } from './app.service';
import { dateNow } from './core/utils/helpers';
import GrpcService from './grpc/GrpcClient';
import { GraphRequest } from './grpc/types';
import { Parser } from 'csv-parse';

type SheetRow = {
  to: string;
  from: string;
  url: string;
};

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly grpcClient: GrpcService,
  ) {}

  @Get()
  getHello(@Query() queryString): string {
    const { to } = queryString;

    const graphSubscribe = this.grpcClient.register({
      to: to ?? 'B',
      url: 'http://other.service.com',
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

  @Get('/client-stream')
  getStream(): string {
    const graphRequests = new ReplaySubject<GraphRequest>();
    const graphSubscribe = this.grpcClient.registerStream(graphRequests);

    createReadStream('./assets/Graph_gRPC.csv')
      .pipe(
        new Parser({
          delimiter: ',',
          columns: true,
        }),
      )
      .on('data', async (data: SheetRow) => {
        if (typeof data.to !== 'string' || typeof data.from !== 'string')
          return;

        graphRequests.next({
          from: data.from,
          to: data.to,
          infos: {
            date: dateNow(),
            url: data.url,
          },
        });
      })
      .on('end', async () => {
        graphRequests.complete();
      });

    graphSubscribe.subscribe({
      complete: () => console.log('GRPC call is finished'),
      next: (data) => console.log(data),
      error: (err) => {
        if (err) console.log('GRPC call has a error: ', err);
      },
    });

    return this.appService.getHello('client-stream');
  }
}
