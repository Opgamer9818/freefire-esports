import { IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class RequestWithdrawalDto {
  @IsInt()
  @Min(1)
  @Max(10000000)
  amount: number;

  @IsString()
  @MaxLength(100)
  upiId: string;

  @IsOptional()
  @IsString()
  upiQrUrl?: string;
}
