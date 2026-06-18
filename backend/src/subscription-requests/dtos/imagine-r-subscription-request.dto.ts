import { Type } from "class-transformer";
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from "class-validator";

const addressTypes = ["HOLDER", "PAYER"] as const;
const documentTypes = [
  "PHOTO",
  "SCHOOL_CERTIFICATE",
  "ID_DOCUMENT",
  "ADDRESS_PROOF",
  "SCHOLARSHIP_CERTIFICATE",
  "SITUATION_PROOF",
  "PAYMENT_METHOD",
] as const;
const schoolLevels = ["PRIMARY", "COLLEGE", "LYCEE", "HIGHER_EDUCATION", "OTHER"] as const;
const scholarshipStatuses = ["YES", "NO", "UNKNOWN"] as const;

export class CreateImagineRDraftDto {
  @IsString()
  householdMemberId: string;

  @IsString()
  offerId: string;

  @IsOptional()
  @IsString()
  payerMemberId?: string;
}

export class ImagineRAddressDto {
  @IsString()
  street: string;

  @IsOptional()
  @IsString()
  addressLine1?: string;

  @IsOptional()
  @IsString()
  addressLine2?: string;

  @IsOptional()
  @IsString()
  addressLine3?: string;

  @IsString()
  postalCode: string;

  @IsString()
  city: string;

  @IsOptional()
  @IsString()
  country?: string;
}

export class ImagineRAddressPatchDto extends ImagineRAddressDto {
  @IsIn(addressTypes)
  type: (typeof addressTypes)[number];
}

export class ImagineRDocumentPatchDto {
  @IsIn(documentTypes)
  documentType: (typeof documentTypes)[number];

  @IsOptional()
  @IsString()
  label?: string;

  @IsOptional()
  @IsString()
  simulatedFileName?: string;

  @IsOptional()
  @IsString()
  simulatedMimeType?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  simulatedSizeBytes?: number;

  @IsOptional()
  @IsString()
  simulatedPreviewDataUrl?: string;
}

export class UpdateImagineRRequestDto {
  @IsOptional()
  @IsBoolean()
  hasPreviousImagineR?: boolean;

  @IsOptional()
  @IsBoolean()
  hasCustomerNumber?: boolean;

  @IsOptional()
  @IsString()
  customerNumber?: string;

  @IsOptional()
  @IsBoolean()
  infoCertificationAccepted?: boolean;

  @IsOptional()
  @IsBoolean()
  holderAddressSameAsPayer?: boolean;

  @IsOptional()
  @IsDateString()
  payerBirthDate?: string;

  @IsOptional()
  @IsString()
  schoolZipOrCity?: string;

  @IsOptional()
  @IsString()
  schoolName?: string;

  @IsOptional()
  @IsIn(schoolLevels)
  imagineRSchoolLevel?: (typeof schoolLevels)[number];

  @IsOptional()
  @IsIn(scholarshipStatuses)
  scholarshipStatus?: (typeof scholarshipStatuses)[number];

  @IsOptional()
  @IsBoolean()
  autoRenewalEnabled?: boolean;

  @IsOptional()
  @IsInt()
  @Min(1)
  renewalMonths?: number;

  @IsOptional()
  @IsBoolean()
  intelligentDossierEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  signatureInformationAccepted?: boolean;

  @IsOptional()
  @IsBoolean()
  signaturePayerAccepted?: boolean;

  @IsOptional()
  @IsBoolean()
  signatureTermsAccepted?: boolean;

  @IsOptional()
  @IsBoolean()
  signatureDocumentsAccepted?: boolean;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ImagineRAddressPatchDto)
  addresses?: ImagineRAddressPatchDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ImagineRDocumentPatchDto)
  documents?: ImagineRDocumentPatchDto[];
}
