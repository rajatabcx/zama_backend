import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class StorefrontAPIKeyDTO {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  storeFrontAccessToken: string;
}
