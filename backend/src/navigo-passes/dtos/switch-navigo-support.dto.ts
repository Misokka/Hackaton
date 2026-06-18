import { IsIn } from "class-validator";

export class SwitchNavigoSupportDto {
  @IsIn(["PHYSICAL", "DIGITAL"])
  targetSupport!: "PHYSICAL" | "DIGITAL";
}
