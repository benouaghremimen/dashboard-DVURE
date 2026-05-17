import { IsEmail, IsNotEmpty, IsString, MinLength, IsIn, IsOptional } from 'class-validator';

export class CreateUserDto {
    @IsEmail()
    email!: string;

    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    clubName?: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(6)
    password!: string;

    @IsString()
    @IsNotEmpty()
    @IsIn(['ADMIN', 'CLUB'])
    role!: 'ADMIN' | 'CLUB';
}
