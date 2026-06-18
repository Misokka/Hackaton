import { IsIn, IsOptional, IsString, MinLength, ValidateIf } from "class-validator";

const ADMIN_DOCUMENT_STATUSES = ["VALIDATED", "REJECTED", "UNDER_REVIEW"] as const;

export class UpdateAdminSubscriptionDocumentDto {
  @IsIn(ADMIN_DOCUMENT_STATUSES)
  status: (typeof ADMIN_DOCUMENT_STATUSES)[number];

  @ValidateIf((data: UpdateAdminSubscriptionDocumentDto) => data.status === "REJECTED")
  @IsString()
  @MinLength(3)
  rejectionReason?: string;

  @IsOptional()
  @IsString()
  note?: string;
}
