import { IsIn, IsString, MaxLength, MinLength } from 'class-validator';

export class RespondTicketDto {
  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  adminResponse: string;

  @IsIn(['IN_PROGRESS', 'RESOLVED', 'CLOSED'])
  status: string;
}
