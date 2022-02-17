import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client, ClientGrpc, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { Observable, ReplaySubject } from 'rxjs';
import { dateNow, getFilesFromDirectory } from 'src/core/utils/helpers';
import { GraphRequest, GraphResponse } from './types';
import { Metadata } from '@grpc/grpc-js';

type RegisterType = { to: string; url: string };

type GraphService = {
  register(
    data: GraphRequest,
    metadata?: Metadata,
    options?: {
      deadline?: Date | number;
    },
  ): Observable<any>;
  registerStream(data: ReplaySubject<GraphRequest>): Observable<any>;
};

@Injectable()
class GrpcService implements OnModuleInit {
  @Client({
    transport: Transport.GRPC,
    options: {
      package: 'graphpb',
      protoPath: getFilesFromDirectory(join(__dirname, '../../assets/proto'))
        .files,
      url: 'localhost:50051',
    },
  })
  private client: ClientGrpc;
  private graphService: GraphService;

  constructor(private readonly configs: ConfigService) {}

  onModuleInit = () => {
    this.graphService = this.client.getService<GraphService>('GraphService');
  };

  register = (data: RegisterType): Observable<GraphResponse> => {
    const metadata = new Metadata();
    const deadline = new Date(Date.now() + 100);

    return this.graphService.register(
      {
        from: this.configs.get('GRPC_SERVICE_NAME'),
        to: data.to,
        infos: {
          url: data.url,
          date: dateNow(),
        },
      },
      metadata,
      {
        deadline,
      },
    );
  };

  registerStream = (data: ReplaySubject<GraphRequest>) => {
    return this.graphService.registerStream(data);
  };
}

export default GrpcService;
