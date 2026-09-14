import { IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class ApproveRedeemDto {
  @IsInt()
  @Min(1)
  @Max(100000)
  approvedCoins: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}
