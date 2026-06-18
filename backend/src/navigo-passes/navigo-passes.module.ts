import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { JWT_SECRET } from "src/auth/auth.constants";
import { PrismaModule } from "src/prisma/prisma.module";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { NavigoPassesController } from "./navigo-passes.controller";
import { NavigoPassesService } from "./navigo-passes.service";

@Module({
  imports: [
    PrismaModule,
    JwtModule.register({
      secret: JWT_SECRET,
      signOptions: { expiresIn: "7d" },
    }),
  ],
  controllers: [NavigoPassesController],
  providers: [NavigoPassesService, JwtAuthGuard],
  exports: [NavigoPassesService],
})
export class NavigoPassesModule {}
