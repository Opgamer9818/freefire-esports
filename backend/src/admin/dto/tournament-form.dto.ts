import { IsBoolean, IsIn, IsInt, IsISO8601, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class TournamentFormDto {
  @IsString()
  @MaxLength(100)
  name: string;

  @IsIn(['SOLO', 'DUO', 'SQUAD', 'CUSTOM'])
  format: string;

  @IsInt()
  @Min(1)
  @Max(100)
  teamSize: number;

  @IsBoolean()
  isFree: boolean;

  @IsInt()
  @Min(0)
  entryFeeCoins: number;

  @IsInt()
  @Min(0)
  prizePool: number;

  @IsInt()
  @Min(1)
  slots: number;

  @IsISO8601()
  date: string;

  @IsISO8601()
  startTime: string;

  @IsISO8601()
  registrationOpenAt: string;

  @IsISO8601()
  registrationCloseAt: string;

  @IsOptional()
  @IsString()
  rules?: string;

  @IsOptional()
  @IsIn([
    'DRAFT',
    'UPCOMING',
    'REGISTRATION_OPEN',
    'REGISTRATION_CLOSED',
    'FULL',
    'ROOM_RELEASED',
    'LIVE',
    'RESULT_PENDING',
    'COMPLETED',
    'CANCELLED',
  ])
  status?: string;
}
