import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TrafficModule } from './traffic/traffic.module';
import { AccountsModule } from './accounts/accounts.module';
import { ConversationsModule } from './conversations/conversations.module';
import { OrdersTypeModule } from './orderstype/orderstype.module';
import { MessagestextModule } from './messagestext/messagestext.module';
import { OrdersModule } from './orders/orders.module';
import { ErrorsModule } from './errors/errors.module';
import { PirateLinkModule } from './piratelink/piratelink.module';
import { ExternalPaymentsModule } from './external-payments/external-payments.module';
import { ConversationsInsightsModule } from './conversations-insights/conversations-insights.module';
import { TrafficPerInstanceModule } from './traffic-per-instance/traffic-per-instance.module';
import { SmsAnalyticsModule } from './sms-analytics/sms-analytics.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TrafficModule,
    AccountsModule,
    ConversationsModule,
    OrdersTypeModule,
    MessagestextModule,
    ErrorsModule,
    OrdersModule,
    PirateLinkModule,
    ExternalPaymentsModule,
    ConversationsInsightsModule,
    TrafficPerInstanceModule,
    SmsAnalyticsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
