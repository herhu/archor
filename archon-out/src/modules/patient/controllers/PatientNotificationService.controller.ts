import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { PatientNotificationServiceService } from '../services/PatientNotificationService.service';
import { CreatePatientNotificationDto } from '../dtos/create-patientnotification.dto';
import { JwtAuthGuard } from '../../auth/jwt.guard';
import { ScopesGuard } from '../../auth/scopes.guard';
import { Scopes } from '../../auth/scopes.decorator';

@Controller('notifications')
export class PatientNotificationServiceController {
constructor(private readonly service: PatientNotificationServiceService) {}

@Post()
@UseGuards(JwtAuthGuard, ScopesGuard)
@Scopes('patient:write')
async create(@Body() dto: CreatePatientNotificationDto) {
return this.service.create(dto);
}

@Get()
@UseGuards(JwtAuthGuard, ScopesGuard)
@Scopes('patient:read')
async findAll() {
return this.service.findAll();
}

@Get(':id')
@UseGuards(JwtAuthGuard, ScopesGuard)
@Scopes('patient:read')
async findOne(@Param('id') id: string) {
return this.service.findOne(id);
}

@Patch(':id')
@UseGuards(JwtAuthGuard, ScopesGuard)
@Scopes('patient:write')
async update(@Param('id') id: string, @Body() dto: any) {
return this.service.update(id, dto);
}

@Delete(':id')
@UseGuards(JwtAuthGuard, ScopesGuard)
@Scopes('patient:write')
async delete(@Param('id') id: string) {
return this.service.delete(id);
}

// Custom operations
@Patch('/toggle')
@UseGuards(JwtAuthGuard, ScopesGuard)
@Scopes('notifications:toggle')
async Toggle(@Body() body: any) {
// TODO: Implement operation logic
return { message: 'Operation Toggle executed' };
}
@Get('/status')
@UseGuards(JwtAuthGuard, ScopesGuard)
@Scopes('patient:read')
async Status() {
// TODO: Implement operation logic
return { message: 'Operation Status executed' };
}
}