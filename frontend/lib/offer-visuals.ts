import type { OfferProductType } from "./api/types";

export function getOfferVisual(productType: OfferProductType) {
  switch (productType) {
    case "IMAGINE_R_JUNIOR":
      return "/assets/illustrations/young-girl-waving.png";
    case "IMAGINE_R_SCHOOL":
      return "/assets/illustrations/young-woman-backpack.png";
    case "IMAGINE_R_STUDENT":
      return "/assets/illustrations/blonde-woman-standing.png";
    case "NAVIGO_SENIOR":
      return "/assets/illustrations/senior-woman-with-cane.png";
    case "AMETHYSTE":
      return "/assets/illustrations/senior-man-with-cap.png";
    case "NAVIGO_LIBERTE":
      return "/assets/illustrations/hand-tapping-contactless.png";
    case "NAVIGO_ANNUAL":
      return "/assets/illustrations/businessman-with-briefcase.png";
    default:
      return "/assets/logos/pictogrammes/generic-pass-card.png";
  }
}
