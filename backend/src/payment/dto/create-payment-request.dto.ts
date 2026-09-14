import { IsInt, Max, Min } from 'class-validator';

export class CreatePaymentRequestDto {
  @IsInt()
  @Min(1)
  @Max(100000)
  requestedCoins: number;
}
