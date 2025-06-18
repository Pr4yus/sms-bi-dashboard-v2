import { Controller, Get, Query } from '@nestjs/common';
import { OrdersTypeService } from './orderstype.service';

@Controller('orderstype')
export class OrdersTypeController {
  constructor(private readonly ordersTypeService: OrdersTypeService) {}

  @Get('orders')
  async getOrders(
    @Query('account_name') account_name?: string | string[],
    @Query('year') year?: number,
    @Query('month') month?: string,
    @Query('day') day?: string,
    @Query('type') type?: string,
    @Query('type_channel') type_channel?: string,
    @Query('payment_provider') payment_provider?: string,
  ) {
    const orders = await this.ordersTypeService.getOrders({
      account_name,
      year,
      month,
      day,
      type,
      type_channel,
      payment_provider,
    });

    // Handle missing order_number field
    return orders.map((order) => ({
      ...order,
      order_number: order.order_number || 'N/A', // Provide a default value if order_number is missing
    }));
  }
}
