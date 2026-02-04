import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiOAuth2,
} from "@nestjs/swagger";
import { PatientNotificationService } from "../services/patient-notification.service";
import { CreatePatientNotificationDto } from "../dtos/create-patient-notification.dto";
import { JwtAuthGuard } from "../../../auth/jwt.guard";
import { ScopesGuard } from "../../../auth/scopes.guard";
import { Scopes } from "../../../auth/scopes.decorator";

@ApiTags("patient")
@ApiBearerAuth("bearer")
@Controller("notifications")
export class PatientNotificationController {
  constructor(private readonly service: PatientNotificationService) {}

  @Post()
  @ApiOperation({ summary: "Create PatientNotification" })
  @ApiOAuth2(["patient:write"])
  @UseGuards(JwtAuthGuard, ScopesGuard)
  @Scopes("patient:write")
  async create(@Body() dto: CreatePatientNotificationDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: "List PatientNotifications" })
  @ApiOAuth2(["patient:read"])
  @UseGuards(JwtAuthGuard, ScopesGuard)
  @Scopes("patient:read")
  async findAll() {
    return this.service.findAll();
  }

  @Get(":id")
  @ApiOperation({ summary: "Get PatientNotification" })
  @ApiOAuth2(["patient:read"])
  @UseGuards(JwtAuthGuard, ScopesGuard)
  @Scopes("patient:read")
  async findOne(@Param("id") id: number) {
    return this.service.findOne(id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update PatientNotification" })
  @ApiOAuth2(["patient:write"])
  @UseGuards(JwtAuthGuard, ScopesGuard)
  @Scopes("patient:write")
  async update(@Param("id") id: number, @Body() dto: any) {
    return this.service.update(id, dto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete PatientNotification" })
  @ApiOAuth2(["patient:write"])
  @UseGuards(JwtAuthGuard, ScopesGuard)
  @Scopes("patient:write")
  async delete(@Param("id") id: number) {
    return this.service.delete(id);
  }

  // Custom operations
  @Patch("/toggle")
  @ApiOperation({ summary: "Toggle" })
  @ApiOAuth2([])
  @UseGuards(JwtAuthGuard, ScopesGuard)
  @Scopes()
  async Toggle(@Body() body: any) {
    // TODO: Implement operation logic
    return { message: "Operation Toggle executed" };
  }
  @Get("/status")
  @ApiOperation({ summary: "Status" })
  async Status() {
    // TODO: Implement operation logic
    return { message: "Operation Status executed" };
  }
}
