import { Controller, Get, UseGuards } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ApiKeyGuard } from '../common/guards/api-key.guard';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get('import')
  @UseGuards(ApiKeyGuard)
  async triggerImportProducts() {
    this.productsService.importProducts();
    return true;
  }
}
