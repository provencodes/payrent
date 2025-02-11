import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsJWT } from "class-validator";

export class EmailVerificationDto {
 @ApiProperty({ type: "string", description: "A valid JWT token" })
 @IsJWT()
 token: string;
}

export class ResendEmailVerificationDto {
 @ApiProperty({ type: "string", description: "A valid email" })
 @IsEmail()
 email: string;
}