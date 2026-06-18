import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { AdminRoleGuard } from "./admin-role.guard";
import { AdminService } from "./admin.service";
import { CreateAdminFoundPassDto } from "./dtos/create-admin-found-pass.dto";
import { FinalChoiceAdminSosCaseDto } from "./dtos/final-choice-admin-sos-case.dto";
import { RejectAdminSubscriptionRequestDto } from "./dtos/reject-admin-subscription-request.dto";
import { UpdateAdminSosCaseStatusDto } from "./dtos/update-admin-sos-case-status.dto";
import { UpdateAdminSubscriptionDocumentDto } from "./dtos/update-admin-subscription-document.dto";
import { UpdateAdminSubscriptionRequestDto } from "./dtos/update-admin-subscription-request.dto";
import { UpdateAdminSupportCaseDto } from "./dtos/update-admin-support-case.dto";

@Controller("api/admin")
@UseGuards(JwtAuthGuard, AdminRoleGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get("dashboard")
  async getDashboard() {
    return this.adminService.getDashboard();
  }

  @Get("search")
  async search(@Query("q") query = "") {
    return this.adminService.search(query);
  }

  @Get("users")
  async getUsers() {
    return this.adminService.getUsers();
  }

  @Get("users/:id")
  async getUser(@Param("id") id: string) {
    return this.adminService.getUser(id);
  }

  @Get("families")
  async getFamilies() {
    return this.adminService.getFamilies();
  }

  @Get("families/:id")
  async getFamily(@Param("id") id: string) {
    return this.adminService.getFamily(id);
  }

  @Get("subscription-requests")
  async getSubscriptionRequests(
    @Query("filter") filter = "all",
    @Query("q") query = "",
  ) {
    return this.adminService.getSubscriptionRequests(filter, query);
  }

  @Get("subscription-requests/:id")
  async getSubscriptionRequest(@Param("id") id: string) {
    return this.adminService.getSubscriptionRequest(id);
  }

  @Get("subscription-requests/:id/documents/:documentId/preview")
  async getSubscriptionRequestDocumentPreview(
    @Param("id") id: string,
    @Param("documentId") documentId: string,
  ) {
    return this.adminService.getSubscriptionRequestDocumentPreview(id, documentId);
  }

  @Patch("subscription-requests/:id")
  async updateSubscriptionRequest(
    @Param("id") id: string,
    @Body() data: UpdateAdminSubscriptionRequestDto,
  ) {
    return this.adminService.updateSubscriptionRequest(id, data);
  }

  @Patch("subscription-requests/:id/documents/:documentId")
  async updateSubscriptionRequestDocument(
    @Param("id") id: string,
    @Param("documentId") documentId: string,
    @Body() data: UpdateAdminSubscriptionDocumentDto,
  ) {
    return this.adminService.updateSubscriptionRequestDocument(id, documentId, data);
  }

  @Post("subscription-requests/:id/approve")
  async approveSubscriptionRequest(@Param("id") id: string) {
    return this.adminService.approveSubscriptionRequest(id);
  }

  @Post("subscription-requests/:id/reject")
  async rejectSubscriptionRequest(
    @Param("id") id: string,
    @Body() data: RejectAdminSubscriptionRequestDto,
  ) {
    return this.adminService.rejectSubscriptionRequest(id, data);
  }

  @Get("support-cases")
  async getSupportCases() {
    return this.adminService.getSupportCases();
  }

  @Get("sos-navigo/dashboard")
  async getSosNavigoDashboard() {
    return this.adminService.getSosNavigoDashboard();
  }

  @Get("sos-navigo/cases")
  async getSosNavigoCases(
    @Query("filter") filter = "all",
    @Query("q") query = "",
  ) {
    return this.adminService.getSosNavigoCases(filter, query);
  }

  @Get("sos-navigo/cases/:id")
  async getSosNavigoCase(@Param("id") id: string) {
    return this.adminService.getSosNavigoCase(id);
  }

  @Post("sos-navigo/found-pass")
  async registerFoundPass(@Body() data: CreateAdminFoundPassDto) {
    return this.adminService.registerFoundPass(data);
  }

  @Patch("sos-navigo/cases/:id/notify")
  async notifySosNavigoCase(@Param("id") id: string) {
    return this.adminService.notifySosNavigoCase(id);
  }

  @Patch("sos-navigo/cases/:id/status")
  async updateSosNavigoCaseStatus(
    @Param("id") id: string,
    @Body() data: UpdateAdminSosCaseStatusDto,
  ) {
    return this.adminService.updateSosNavigoCaseStatus(id, data);
  }

  @Patch("sos-navigo/cases/:id/picked-up")
  async markSosNavigoCasePickedUp(@Param("id") id: string) {
    return this.adminService.markSosNavigoCasePickedUp(id);
  }

  @Patch("sos-navigo/cases/:id/final-choice")
  async registerAdminSosNavigoFinalChoice(
    @Param("id") id: string,
    @Body() data: FinalChoiceAdminSosCaseDto,
  ) {
    return this.adminService.registerAdminSosNavigoFinalChoice(id, data);
  }

  @Patch("sos-navigo/cases/:id/destroy-pass")
  async destroySosNavigoPass(@Param("id") id: string) {
    return this.adminService.destroySosNavigoPass(id);
  }

  @Patch("support-cases/:id")
  async updateSupportCase(
    @Param("id") id: string,
    @Body() data: UpdateAdminSupportCaseDto,
  ) {
    return this.adminService.updateSupportCase(id, data);
  }
}
