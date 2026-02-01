"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PatientModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const patient_notification_service_1 = require("./services/patient-notification.service");
const patient_notification_controller_1 = require("./controllers/patient-notification.controller");
const patient_notification_entity_1 = require("./entities/patient-notification.entity");
let PatientModule = class PatientModule {
};
exports.PatientModule = PatientModule;
exports.PatientModule = PatientModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                patient_notification_entity_1.PatientNotification,
            ]),
        ],
        controllers: [
            patient_notification_controller_1.PatientNotificationController,
        ],
        providers: [
            patient_notification_service_1.PatientNotificationService,
        ],
    })
], PatientModule);
//# sourceMappingURL=patient.module.js.map