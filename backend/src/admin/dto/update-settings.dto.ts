import { IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class UpdateSettingsDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  upi_id?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  upi_payee_name?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(1000)
  coin_rate_inr?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  min_withdrawal?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  max_withdrawal?: number;
}
