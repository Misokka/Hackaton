import { Body, Controller, Param, Post, Req, UseGuards } from "@nestjs/common";
import type { AuthenticatedRequest } from "src/auth/guards/jwt-auth.guard";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { SwitchNavigoSupportDto } from "./dtos/switch-navigo-support.dto";
import { NavigoPassesService } from "./navigo-passes.service";

@Controller("api/navigo-passes")
@UseGuards(JwtAuthGuard)
export class NavigoPassesController {
  constructor(private readonly navigoPassesService: NavigoPassesService) {}

  @Post("members/:memberId/switch-support")
  async switchSupport(
    @Req() request: AuthenticatedRequest,
    @Param("memberId") memberId: string,
    @Body() data: SwitchNavigoSupportDto,
  ) {
    return this.navigoPassesService.switchSupportForUser(request.user.sub, memberId, data.targetSupport);
  }
}
