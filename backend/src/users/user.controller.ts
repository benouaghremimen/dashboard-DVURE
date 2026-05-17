import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Post,
    Put,
    UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class UserController {
    constructor(private readonly userService: UserService) { }

    @Get()
    async findAll() {
        const users = await this.userService.findAll();
        return users.map((user) => {
            const { password, resetPasswordTokenHash, resetPasswordExpiresAt, ...safeUser } = user;
            return safeUser;
        });
    }

    @Post()
    async create(@Body() dto: CreateUserDto) {
        const user = await this.userService.create(dto);
        const { password, resetPasswordTokenHash, resetPasswordExpiresAt, ...safeUser } = user;
        return safeUser;
    }

    @Put(':id')
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateUserDto,
    ) {
        const user = await this.userService.update(id, dto);
        const { password, resetPasswordTokenHash, resetPasswordExpiresAt, ...safeUser } = user;
        return safeUser;
    }

    @Delete(':id')
    async remove(@Param('id', ParseIntPipe) id: number) {
        await this.userService.remove(id);
        return { success: true };
    }
}
