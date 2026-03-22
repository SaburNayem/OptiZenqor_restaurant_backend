import { Global, Module } from '@nestjs/common';
import { OrderEventsGateway } from './order-events.gateway';

@Global()
@Module({
  providers: [OrderEventsGateway],
  exports: [OrderEventsGateway],
})
export class GatewaysModule {}
