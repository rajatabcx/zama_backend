import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class UpdateHourDelayDTO {
  @IsNumber()
  @IsNotEmpty()
  @IsOptional()
  hour: number;
}
