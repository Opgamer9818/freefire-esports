import { IsBoolean, IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  displayName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  fullName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  ffUid?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  ffIgn?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  whatsappNumber?: string;

  @IsOptional()
  @IsString()
  @MaxLength(56)
  country?: string;

  @IsOptional()
  @IsIn(['black_gold', 'dark_esports'])
  themePreference?: string;

  @IsOptional()
  @IsBoolean()
  notificationsEnabled?: boolean;
}
