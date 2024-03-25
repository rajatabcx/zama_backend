import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class DemoEmailDTO {
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
