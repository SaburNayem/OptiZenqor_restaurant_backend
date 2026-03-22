import { IsBoolean, IsLatitude, IsLongitude, IsOptional, IsString } from 'class-validator';

export class CreateBranchDto {
  @IsString()
  name: string;

  @IsString()
  code: string;

  @IsString()
  city: string;

  @IsString()
  addressLine: string;

  @IsString()
  phone: string;

  @IsString()
  timezone: string;

  @IsOptional()
  @IsString()
  openingHoursJson?: string;

  @IsOptional()
  @IsLatitude()
  lat?: string;

  @IsOptional()
  @IsLongitude()
  lng?: string;

  @IsOptional()
  @IsBoolean()
  isOpen?: boolean;
}
