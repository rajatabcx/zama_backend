import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class AddToNewsLetterDTO {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
