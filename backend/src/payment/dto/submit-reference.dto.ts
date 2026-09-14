import { IsOptional, IsString, MaxLength } from 'class-validator';

export class SubmitReferenceDto {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  utrReference?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  screenshotUrl?: string;
}
