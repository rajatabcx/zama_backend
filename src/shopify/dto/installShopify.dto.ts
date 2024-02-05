import { IsNotEmpty, IsString } from 'class-validator';

export class InstallShopifyDTO {
  @IsString()
  @IsNotEmpty()
  shopName: string;
}
