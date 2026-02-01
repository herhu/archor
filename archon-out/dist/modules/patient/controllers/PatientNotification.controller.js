"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PatientNotificationController = void 0;
const common_1 = require("@nestjs/common");
const PatientNotification_service_1 = require("../services/PatientNotification.service");
const create_patientnotification_dto_1 = require("../dtos/create-patientnotification.dto");
const jwt_guard_1 = require("../../../auth/jwt.guard");
const scopes_guard_1 = require("../../../auth/scopes.guard");
const scopes_decorator_1 = require("../../../auth/scopes.decorator");
let PatientNotificationController = class PatientNotificationController {
    constructor(service) {
        this.service = service;
    }
    async create(dto) {
        return this.service.create(dto);
    }
    async findAll() {
        return this.service.findAll();
    }
    async findOne(id) {
        return this.service.findOne(id);
    }
    async update(id, dto) {
        return this.service.update(id, dto);
    }
    async delete(id) {
        return this.service.delete(id);
    }
    async Toggle(body) {
        return { message: 'Operation Toggle executed' };
    }
    async Status() {
        return { message: 'Operation Status executed' };
    }
};
exports.PatientNotificationController = PatientNotificationController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard, scopes_guard_1.ScopesGuard),
    (0, scopes_decorator_1.Scopes)('patient:write'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_patientnotification_dto_1.CreatePatientNotificationDto]),
    __metadata("design:returntype", Promise)
], PatientNotificationController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard, scopes_guard_1.ScopesGuard),
    (0, scopes_decorator_1.Scopes)('patient:read'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PatientNotificationController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard, scopes_guard_1.ScopesGuard),
    (0, scopes_decorator_1.Scopes)('patient:read'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PatientNotificationController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard, scopes_guard_1.ScopesGuard),
    (0, scopes_decorator_1.Scopes)('patient:write'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PatientNotificationController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard, scopes_guard_1.ScopesGuard),
    (0, scopes_decorator_1.Scopes)('patient:write'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PatientNotificationController.prototype, "delete", null);
__decorate([
    (0, common_1.Patch)('/toggle'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard, scopes_guard_1.ScopesGuard),
    (0, scopes_decorator_1.Scopes)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PatientNotificationController.prototype, "Toggle", null);
__decorate([
    (0, common_1.Get)('/status'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PatientNotificationController.prototype, "Status", null);
exports.PatientNotificationController = PatientNotificationController = __decorate([
    (0, common_1.Controller)('notifications'),
    __metadata("design:paramtypes", [PatientNotification_service_1.PatientNotificationService])
], PatientNotificationController);
//# sourceMappingURL=PatientNotification.controller.js.map