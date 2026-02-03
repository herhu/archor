import {
  IsString,
  IsBoolean,
  IsInt,
  IsOptional,
  IsObject,
  Min,
  Max,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreatePatientNotificationDto {
  @ApiProperty({
    description: "Customer identifier",
    example: "customer-123",
  })
  @IsString()
  customerId: string;

  @ApiProperty({
    description: "Notification priority (0 = lowest, 10 = highest)",
    example: 5,
    minimum: 0,
    maximum: 10,
  })
  @IsInt()
  @Min(0)
  @Max(10)
  priority: number;

  @ApiPropertyOptional({
    description: "Arbitrary metadata for the notification",
    example: { channel: "email", retries: 3 },
  })
  @IsOptional()
  @IsObject()
  meta?: Record<string, any>;

  @ApiProperty({
    description: "Whether the notification is enabled",
    example: true,
  })
  @IsBoolean()
  enabled: boolean;
}
