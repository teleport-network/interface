import { Body, Controller, Get, Post} from '@nestjs/common';
import { AppService } from './app.service';
import { QuoteQueryParams } from './app.module';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('quote')
  getQuote(@Body() data: QuoteQueryParams) {
    return this.appService.getQuote(data);
  }
}
