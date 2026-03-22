import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' }, namespace: '/orders' })
export class OrderEventsGateway {
  @WebSocketServer()
  server: Server;

  publishNewOrder(branchId: string, payload: unknown) {
    this.server.to(`branch:${branchId}`).emit('order.new', payload);
    this.server.emit('dashboard.refresh', { type: 'new_order', branchId });
  }

  publishStatusUpdate(branchId: string, payload: unknown) {
    this.server.to(`branch:${branchId}`).emit('order.status', payload);
    this.server.emit('dashboard.refresh', { type: 'order_status', branchId });
  }

  publishKitchenUpdate(branchId: string, payload: unknown) {
    this.server.to(`branch:${branchId}`).emit('kitchen.queue', payload);
    this.server.emit('dashboard.refresh', { type: 'kitchen_update', branchId });
  }
}
