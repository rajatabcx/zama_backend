import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsString,
} from 'class-validator';

export class UpdateProductUpsellProductsDTO {
  @IsString({ each: true })
  @IsNotEmpty()
  @IsArray()
  @ArrayMaxSize(2)
  @ArrayMinSize(2)
  productsIds: string[];
}
