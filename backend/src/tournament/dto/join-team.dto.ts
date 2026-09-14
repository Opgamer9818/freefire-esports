import { IsOptional, IsString, MaxLength } from 'class-validator';

export class JoinTeamDto {
  @IsString()
  @MaxLength(30)
  ffUid: string;

  @IsString()
  @MaxLength(50)
  ffIgn: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  contact?: string;
}
