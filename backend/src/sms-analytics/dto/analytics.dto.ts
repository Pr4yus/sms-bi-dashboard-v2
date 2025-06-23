import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsArray, IsObject } from 'class-validator';

export class AnalysisDto {
  @ApiProperty({ description: 'País analizado' })
  @IsString()
  country: string;

  @ApiProperty({ description: 'Año del análisis' })
  @IsNumber()
  year: number;

  @ApiProperty({ description: 'Mes del análisis' })
  @IsNumber()
  month: number;

  @ApiProperty({ description: 'Total de SMS' })
  @IsNumber()
  total_sms: number;

  @ApiProperty({ description: 'SMS exitosos' })
  @IsNumber()
  successful_sms: number;

  @ApiProperty({ description: 'SMS con errores' })
  @IsNumber()
  error_sms: number;

  @ApiProperty({ description: 'Tasa de éxito' })
  @IsNumber()
  success_rate: number;

  @ApiProperty({ description: 'Cuentas analizadas' })
  @IsArray()
  accounts: any[];

  @ApiProperty({ description: 'Fecha de generación' })
  @IsString()
  generated_at: string;
}

export class CountryAnalysisDto extends AnalysisDto {
  @ApiProperty({ description: 'Métricas por cuenta' })
  @IsArray()
  account_metrics: any[];

  @ApiProperty({ description: 'Resumen del país' })
  @IsObject()
  summary: any;
}

export class RegionalAnalysisDto {
  @ApiProperty({ description: 'Año del análisis regional' })
  @IsNumber()
  year: number;

  @ApiProperty({ description: 'Mes del análisis regional' })
  @IsNumber()
  month: number;

  @ApiProperty({ description: 'Total de SMS regional' })
  @IsNumber()
  total_sms: number;

  @ApiProperty({ description: 'SMS exitosos regional' })
  @IsNumber()
  total_successful: number;

  @ApiProperty({ description: 'SMS con errores regional' })
  @IsNumber()
  total_errors: number;

  @ApiProperty({ description: 'Tasa de éxito regional' })
  @IsNumber()
  overall_success_rate: number;

  @ApiProperty({ description: 'Cuentas clave por país' })
  @IsObject()
  key_accounts: any;

  @ApiProperty({ description: 'Fecha de generación' })
  @IsString()
  generated_at: string;
}

export class AccountAnalysisDto {
  @ApiProperty({ description: 'UID de la cuenta' })
  @IsString()
  account_uid: string;

  @ApiProperty({ description: 'Nombre de la cuenta' })
  @IsString()
  account_name: string;

  @ApiProperty({ description: 'Total de SMS de la cuenta' })
  @IsNumber()
  total_sms: number;

  @ApiProperty({ description: 'SMS exitosos de la cuenta' })
  @IsNumber()
  successful_sms: number;

  @ApiProperty({ description: 'SMS con errores de la cuenta' })
  @IsNumber()
  error_sms: number;

  @ApiProperty({ description: 'Tasa de éxito de la cuenta' })
  @IsNumber()
  success_rate: number;

  @ApiProperty({ description: 'Balance vs paquete' })
  @IsOptional()
  @IsObject()
  balance_vs_package?: any;
}

export class HierarchicalViewDto {
  @ApiProperty({ description: 'País' })
  @IsString()
  country: string;

  @ApiProperty({ description: 'Año' })
  @IsNumber()
  year: number;

  @ApiProperty({ description: 'Mes' })
  @IsNumber()
  month: number;

  @ApiProperty({ description: 'Estructura jerárquica' })
  @IsArray()
  hierarchical_structure: any[];

  @ApiProperty({ description: 'Total de cuentas padre' })
  @IsNumber()
  total_parent_accounts: number;

  @ApiProperty({ description: 'Total de cuentas hijas' })
  @IsNumber()
  total_child_accounts: number;
}

export class CommercialViewDto {
  @ApiProperty({ description: 'País' })
  @IsString()
  country: string;

  @ApiProperty({ description: 'Año' })
  @IsNumber()
  year: number;

  @ApiProperty({ description: 'Mes' })
  @IsNumber()
  month: number;

  @ApiProperty({ description: 'Clientes agrupados' })
  @IsArray()
  clients: any[];

  @ApiProperty({ description: 'Total de clientes' })
  @IsNumber()
  total_clients: number;

  @ApiProperty({ description: 'Total de cuentas' })
  @IsNumber()
  total_accounts: number;
} 