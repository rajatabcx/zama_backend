import { IsNotEmpty, IsString } from 'class-validator';

export class CreateProductUpsellDTO {
  @IsString()
  @IsNotEmpty()
  name: string;
}
