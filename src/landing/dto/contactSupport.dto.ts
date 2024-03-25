import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class ContactSupportDTO {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  query: string;
}
