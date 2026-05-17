"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bcrypt = __importStar(require("bcrypt"));
const user_entity_1 = require("./user.entity"); // Corrected import path (same dir)
const reservation_entity_1 = require("../reservations/reservation.entity");
let UserService = class UserService {
    constructor(userRepo, reservationRepo) {
        this.userRepo = userRepo;
        this.reservationRepo = reservationRepo;
    }
    findOne(id) {
        return this.userRepo.findOne({ where: { id } });
    }
    findByEmail(email) {
        return this.userRepo.findOne({ where: { email } });
    }
    findByResetTokenHash(tokenHash) {
        return this.userRepo.findOne({ where: { resetPasswordTokenHash: tokenHash } });
    }
    async create(dto) {
        const existing = await this.findByEmail(dto.email);
        if (existing) {
            throw new common_1.ConflictException('Email already in use');
        }
        const storedPassword = await bcrypt.hash(dto.password, 10);
        const user = this.userRepo.create({
            ...dto,
            password: storedPassword,
            passwordIsHashed: true,
        });
        return this.userRepo.save(user);
    }
    async findAll() {
        return this.userRepo.find({
            order: { id: 'DESC' },
        });
    }
    async update(id, dto) {
        const user = await this.findOne(id);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        if (dto.email && dto.email !== user.email) {
            const existing = await this.findByEmail(dto.email);
            if (existing) {
                throw new common_1.ConflictException('Email already in use');
            }
            user.email = dto.email;
        }
        if (dto.password) {
            user.password = await bcrypt.hash(dto.password, 10);
            user.passwordIsHashed = true;
        }
        if (dto.role) {
            user.role = dto.role;
        }
        if (typeof dto.isActive === 'boolean') {
            user.isActive = dto.isActive;
        }
        if (typeof dto.name === 'string') {
            user.name = dto.name;
        }
        if (typeof dto.clubName === 'string') {
            user.clubName = dto.clubName;
        }
        return this.userRepo.save(user);
    }
    async setResetToken(user, tokenHash, expiresAt) {
        user.resetPasswordTokenHash = tokenHash;
        user.resetPasswordExpiresAt = expiresAt;
        return this.userRepo.save(user);
    }
    async clearResetToken(user) {
        user.resetPasswordTokenHash = null;
        user.resetPasswordExpiresAt = null;
        return this.userRepo.save(user);
    }
    async updatePassword(user, newPassword) {
        user.password = await bcrypt.hash(newPassword, 10);
        user.passwordIsHashed = true;
        user.resetPasswordTokenHash = null;
        user.resetPasswordExpiresAt = null;
        return this.userRepo.save(user);
    }
    async remove(id) {
        await this.reservationRepo
            .createQueryBuilder()
            .delete()
            .where('clubId = :id', { id })
            .execute();
        const result = await this.userRepo.delete(id);
        if (!result.affected) {
            throw new common_1.NotFoundException('User not found');
        }
    }
};
exports.UserService = UserService;
exports.UserService = UserService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(reservation_entity_1.Reservation)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], UserService);
//# sourceMappingURL=user.service.js.map