import { IsString, MaxLength, MinLength } from 'class-validator';

export class SubmitCodeDto {
  @IsString()
  @MinLength(4)
  @MaxLength(50)
  code: string;
}
