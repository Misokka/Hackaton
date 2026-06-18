import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { JWT_SECRET } from "src/auth/auth.constants";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { PrismaModule } from "src/prisma/prisma.module";
import { PaymentsController } from "./payments.controller";
import { PaymentsService } from "./payments.service";

@Module({
  imports: [
    PrismaModule,
    JwtModule.register({
      secret: JWT_SECRET,
      signOptions: { expiresIn: "7d" },
    }),
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService, JwtAuthGuard],
})
export class PaymentsModule {}
