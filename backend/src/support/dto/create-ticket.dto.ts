import { IsIn, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateTicketDto {
  @IsIn(['PAYMENT', 'TOURNAMENT', 'WITHDRAWAL', 'REDEEM', 'ACCOUNT', 'GENERAL'])
  category: string;

  @IsString()
  @MinLength(5)
  @MaxLength(2000)
  message: string;
}
