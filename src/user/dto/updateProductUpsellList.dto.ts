import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateProductUpsellListDTO {
  @IsString()
  @IsNotEmpty()
  listName: string;
}
