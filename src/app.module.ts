import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './guards';
import { CommonModule } from './common/common.module';
import { ShopifyModule } from './shopify/shopify.module';
import { UserModule } from './user/user.module';
import { WebhookModule } from './webhook/webhook.module';
import { EmailModule } from './email/email.module';
import { CronService } from './app.cron.service';
import { ShopifyGraphqlModule } from './shopify-graphql/shopify-graphql.module';
import { AmpModule } from './amp/amp.module';
import { ElasticEmailModule } from './elastic-email/elastic-email.module';
import { LandingModule } from './landing/landing.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    CommonModule,
    ShopifyModule,
    UserModule,
    WebhookModule,
    EmailModule,
    ShopifyGraphqlModule,
    AmpModule,
    ElasticEmailModule,
    LandingModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    CronService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
