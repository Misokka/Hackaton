import "dotenv/config";
import argon2 from "argon2";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { buildNavigoNumber } from "../src/navigo-passes/navigo-number.util";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is required to seed the database.');
}

const pool = new Pool({ connectionString: databaseUrl });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

const demoUserPassword = 'Password123!';
const adminPassword = 'Admin123!';

const adminAccounts = [
  {
    email: 'admin.demo@example.com',
    firstName: 'Admin',
    lastName: 'Demo',
    phone: '0600000001',
  },
  {
    email: 'operations.admin@example.com',
    firstName: 'Operations',
    lastName: 'Admin',
    phone: '0600000002',
  },
];
const offers = [
  {
    slug: 'navigo-annuel',
    name: 'Forfait Navigo Annuel',
    productType: 'NAVIGO_ANNUAL',
    shortDescription: "Voyager en illimité toute l'année.",
    longDescription:
      'Une offre annuelle pour les trajets quotidiens en Île-de-France, avec paiement mensuel possible.',
    priceLabel: '90,80 € / mois',
    durationLabel: 'Annuel',
    targetProfile: 'ADULT',
    order: 1,
    benefits: [
      'Idéal pour les trajets quotidiens',
      'Transports illimités selon zones',
      'Remboursement employeur possible',
    ],
    documents: [
      { documentType: 'ID_DOCUMENT', label: "Pièce d'identité" },
      { documentType: 'PAYMENT_METHOD', label: 'Moyen de paiement' },
    ],
  },
  {
    slug: 'imagine-r-junior',
    name: 'Imagine R Junior',
    productType: 'IMAGINE_R_JUNIOR',
    shortDescription: 'Le forfait annuel des enfants de moins de 11 ans.',
    longDescription:
      'Un titre très avantageux pour les plus jeunes, pensé pour les déplacements du quotidien.',
    priceLabel: '25,20 € / an',
    durationLabel: 'Annuel',
    targetProfile: 'CHILD',
    maxAge: 10,
    order: 2,
    benefits: [
      'Adapté aux moins de 11 ans',
      'Tarif très avantageux',
      'Déplacements en Île-de-France',
    ],
    documents: [
      { documentType: 'PHOTO', label: 'Photo récente' },
      { documentType: 'ID_DOCUMENT', label: "Justificatif d'identité" },
    ],
  },
  {
    slug: 'imagine-r-scolaire',
    name: 'Imagine R Scolaire',
    productType: 'IMAGINE_R_SCHOOL',
    shortDescription: 'Le forfait annuel des jeunes scolarisés.',
    longDescription:
      "Une offre adaptée aux collégiens, lycéens et apprentis, avec un dossier préparé à l'avance.",
    priceLabel: '401,30 € / an',
    durationLabel: 'Annuel',
    targetProfile: 'YOUNG',
    minAge: 11,
    order: 3,
    benefits: [
      'Adapté aux collégiens et lycéens',
      'Transports illimités',
      'Renouvellement anticipable avant la rentrée',
    ],
    documents: [
      { documentType: 'PHOTO', label: 'Photo récente' },
      { documentType: 'ID_DOCUMENT', label: "Justificatif d'identité" },
      { documentType: 'SCHOOL_CERTIFICATE', label: 'Certificat scolaire' },
    ],
  },
  {
    slug: 'imagine-r-etudiant',
    name: 'Imagine R Étudiant',
    productType: 'IMAGINE_R_STUDENT',
    shortDescription: 'Le forfait annuel des étudiants.',
    longDescription:
      'Un parcours étudiant pour comprendre les justificatifs et préparer le dossier sans se perdre.',
    priceLabel: '401,30 € / an',
    durationLabel: 'Annuel',
    targetProfile: 'STUDENT',
    order: 4,
    benefits: [
      'Adapté aux étudiants',
      'Suivi du dossier',
      'Bourse préparée plus tard si concerné',
    ],
    documents: [
      { documentType: 'PHOTO', label: 'Photo récente' },
      { documentType: 'SCHOOL_CERTIFICATE', label: 'Certificat de scolarité' },
      {
        documentType: 'SCHOLARSHIP_CERTIFICATE',
        label: 'Justificatif de bourse si concerné',
        required: false,
      },
    ],
  },
  {
    slug: 'navigo-senior',
    name: 'Navigo Senior',
    productType: 'NAVIGO_SENIOR',
    shortDescription: 'Une offre à vérifier pour les seniors.',
    longDescription:
      "Un accompagnement simple pour préparer une offre adaptée à la situation d'un senior.",
    priceLabel: 'Tarif réduit à vérifier',
    durationLabel: 'Annuel ou mensuel',
    targetProfile: 'SENIOR',
    minAge: 62,
    order: 5,
    benefits: [
      'Adapté aux seniors',
      'Accompagnement simplifié',
      "Possibilité d'aide par un proche",
    ],
    documents: [{ documentType: 'ID_DOCUMENT', label: "Pièce d'identité" }],
  },
  {
    slug: 'amethyste',
    name: 'Améthyste',
    productType: 'AMETHYSTE',
    shortDescription: 'Une offre solidaire selon département et situation.',
    longDescription:
      'Une orientation accompagnée pour vérifier les droits Améthyste sans moteur administratif complet.',
    priceLabel: 'Selon département',
    durationLabel: 'Selon droits',
    targetProfile: 'SENIOR',
    order: 6,
    benefits: [
      'Adapté selon département',
      'Utile pour certains seniors',
      'Vérification accompagnée',
    ],
    documents: [
      { documentType: 'ID_DOCUMENT', label: "Pièce d'identité" },
      { documentType: 'SITUATION_PROOF', label: 'Justificatif de situation' },
    ],
  },
  {
    slug: 'navigo-liberte-plus',
    name: 'Navigo Liberté+',
    productType: 'NAVIGO_LIBERTE',
    shortDescription: "Le paiement à l'usage pour les trajets occasionnels.",
    longDescription:
      'Une offre complémentaire pour voyager ponctuellement sans abonnement mensuel.',
    priceLabel: 'Dès 1,64 € / trajet',
    durationLabel: "À l'usage",
    targetProfile: 'ADULT',
    order: 7,
    benefits: [
      'Adapté aux trajets occasionnels',
      "Paiement à l'usage",
      "Complément d'offre",
    ],
    documents: [{ documentType: 'PAYMENT_METHOD', label: 'Moyen de paiement' }],
  },
] as const;

type DemoMemberInput = {
  key: string;
  firstName: string;
  lastName: string;
  birthDate?: string;
  relationship: 'SELF' | 'CHILD' | 'RELATIVE';
  profileType: 'MANAGER' | 'YOUNG' | 'SENIOR' | 'OTHER';
  schoolLevel?: 'PRIMARY' | 'COLLEGE' | 'LYCEE' | 'HIGHER_EDUCATION' | 'OTHER';
  department?: string;
  isHolder?: boolean;
  isPayer?: boolean;
  isLegalRepresentative?: boolean;
};

type DemoHouseholdInput = {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  householdName: string;
  address: {
    street: string;
    postalCode: string;
    city: string;
  };
  members: DemoMemberInput[];
};

const demoHouseholds: DemoHouseholdInput[] = [
  {
    email: 'sophie.martin@example.com',
    firstName: 'Sophie',
    lastName: 'Martin',
    phone: '0601020304',
    householdName: 'Famille Martin',
    address: { street: '14 rue de Bercy', postalCode: '75012', city: 'Paris' },
    members: [
      {
        key: 'sophie',
        firstName: 'Sophie',
        lastName: 'Martin',
        relationship: 'SELF',
        profileType: 'MANAGER',
        isPayer: true,
        isLegalRepresentative: true,
      },
      {
        key: 'lucas',
        firstName: 'Lucas',
        lastName: 'Martin',
        birthDate: '2013-09-12',
        relationship: 'CHILD',
        profileType: 'YOUNG',
        schoolLevel: 'COLLEGE',
        department: '75',
      },
      {
        key: 'emma',
        firstName: 'Emma',
        lastName: 'Martin',
        birthDate: '2017-03-04',
        relationship: 'CHILD',
        profileType: 'YOUNG',
        schoolLevel: 'PRIMARY',
        department: '75',
      },
      {
        key: 'marie',
        firstName: 'Marie',
        lastName: 'Dupont',
        birthDate: '1958-04-18',
        relationship: 'RELATIVE',
        profileType: 'SENIOR',
        department: '75',
      },
    ],
  },
  {
    email: 'karim.benali@example.com',
    firstName: 'Karim',
    lastName: 'Benali',
    phone: '0611223344',
    householdName: 'Famille Benali',
    address: {
      street: '8 avenue Jean Jaures',
      postalCode: '93200',
      city: 'Saint-Denis',
    },
    members: [
      {
        key: 'karim',
        firstName: 'Karim',
        lastName: 'Benali',
        relationship: 'SELF',
        profileType: 'MANAGER',
        isPayer: true,
        isLegalRepresentative: true,
      },
      {
        key: 'ines',
        firstName: 'Ines',
        lastName: 'Benali',
        birthDate: '2010-01-22',
        relationship: 'CHILD',
        profileType: 'YOUNG',
        schoolLevel: 'LYCEE',
        department: '93',
      },
      {
        key: 'sami',
        firstName: 'Sami',
        lastName: 'Benali',
        birthDate: '2016-06-09',
        relationship: 'CHILD',
        profileType: 'YOUNG',
        schoolLevel: 'PRIMARY',
        department: '93',
      },
    ],
  },
  {
    email: 'elena.garcia@example.com',
    firstName: 'Elena',
    lastName: 'Garcia',
    phone: '0622334455',
    householdName: 'Famille Garcia',
    address: {
      street: '22 boulevard Voltaire',
      postalCode: '75011',
      city: 'Paris',
    },
    members: [
      {
        key: 'elena',
        firstName: 'Elena',
        lastName: 'Garcia',
        relationship: 'SELF',
        profileType: 'MANAGER',
        isPayer: true,
        isLegalRepresentative: true,
      },
      {
        key: 'mateo',
        firstName: 'Mateo',
        lastName: 'Garcia',
        birthDate: '2014-11-17',
        relationship: 'CHILD',
        profileType: 'YOUNG',
        schoolLevel: 'COLLEGE',
        department: '75',
      },
      {
        key: 'lucia',
        firstName: 'Lucia',
        lastName: 'Garcia',
        birthDate: '2007-02-15',
        relationship: 'CHILD',
        profileType: 'YOUNG',
        schoolLevel: 'HIGHER_EDUCATION',
        department: '75',
      },
      {
        key: 'antonio',
        firstName: 'Antonio',
        lastName: 'Garcia',
        birthDate: '1955-12-01',
        relationship: 'RELATIVE',
        profileType: 'SENIOR',
        department: '75',
      },
    ],
  },
  {
    email: 'thomas.leroy@example.com',
    firstName: 'Thomas',
    lastName: 'Leroy',
    phone: '0633445566',
    householdName: 'Famille Leroy',
    address: {
      street: '3 rue des Reservoirs',
      postalCode: '78000',
      city: 'Versailles',
    },
    members: [
      {
        key: 'thomas',
        firstName: 'Thomas',
        lastName: 'Leroy',
        relationship: 'SELF',
        profileType: 'MANAGER',
        isPayer: true,
        isLegalRepresentative: true,
      },
      {
        key: 'noah',
        firstName: 'Noah',
        lastName: 'Leroy',
        birthDate: '2012-05-08',
        relationship: 'CHILD',
        profileType: 'YOUNG',
        schoolLevel: 'COLLEGE',
        department: '78',
      },
      {
        key: 'chloe',
        firstName: 'Chloe',
        lastName: 'Leroy',
        birthDate: '2015-10-30',
        relationship: 'CHILD',
        profileType: 'YOUNG',
        schoolLevel: 'PRIMARY',
        department: '78',
      },
    ],
  },
  {
    email: 'nadia.petit@example.com',
    firstName: 'Nadia',
    lastName: 'Petit',
    phone: '0644556677',
    householdName: 'Famille Petit',
    address: {
      street: '19 rue de la Republique',
      postalCode: '92400',
      city: 'Courbevoie',
    },
    members: [
      {
        key: 'nadia',
        firstName: 'Nadia',
        lastName: 'Petit',
        relationship: 'SELF',
        profileType: 'MANAGER',
        isPayer: true,
        isLegalRepresentative: true,
      },
      {
        key: 'yanis',
        firstName: 'Yanis',
        lastName: 'Petit',
        birthDate: '2009-08-14',
        relationship: 'CHILD',
        profileType: 'YOUNG',
        schoolLevel: 'LYCEE',
        department: '92',
      },
      {
        key: 'sarah',
        firstName: 'Sarah',
        lastName: 'Petit',
        birthDate: '2018-01-05',
        relationship: 'CHILD',
        profileType: 'YOUNG',
        schoolLevel: 'PRIMARY',
        department: '92',
      },
    ],
  },
  {
    email: 'bernard.dubois@example.com',
    firstName: 'Bernard',
    lastName: 'Dubois',
    phone: '0655667788',
    householdName: 'Foyer Bernard Dubois',
    address: {
      street: '6 allee des Tilleuls',
      postalCode: '94000',
      city: 'Creteil',
    },
    members: [
      {
        key: 'bernard',
        firstName: 'Bernard',
        lastName: 'Dubois',
        birthDate: '1951-07-21',
        relationship: 'SELF',
        profileType: 'SENIOR',
        department: '94',
        isPayer: true,
      },
    ],
  },
  {
    email: 'leticia.moreau@example.com',
    firstName: 'Leticia',
    lastName: 'Moreau',
    phone: '0666778899',
    householdName: 'Foyer Leticia Moreau',
    address: { street: '11 rue Oberkampf', postalCode: '75011', city: 'Paris' },
    members: [
      {
        key: 'leticia',
        firstName: 'Leticia',
        lastName: 'Moreau',
        birthDate: '2004-05-19',
        relationship: 'SELF',
        profileType: 'YOUNG',
        schoolLevel: 'HIGHER_EDUCATION',
        department: '75',
        isPayer: true,
      },
    ],
  },
  {
    email: 'julie.garnier@example.com',
    firstName: 'Julie',
    lastName: 'Garnier',
    phone: '0677889900',
    householdName: 'Foyer Julie Garnier',
    address: {
      street: '27 rue de la Convention',
      postalCode: '75015',
      city: 'Paris',
    },
    members: [
      {
        key: 'julie',
        firstName: 'Julie',
        lastName: 'Garnier',
        birthDate: '1989-09-03',
        relationship: 'SELF',
        profileType: 'OTHER',
        department: '75',
        isPayer: true,
      },
    ],
  },
];

function dateAt(value: string, hour = '09:00:00') {
  return new Date(`${value}T${hour}.000Z`);
}

function addDays(date: Date, days: number) {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}

function currentMonthDate(day: number, hour = 9) {
  const now = new Date();
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), day, hour, 0, 0),
  );
}

function simulatedPreview(fileName: string) {
  return `data:text/plain;base64,${Buffer.from(`Document de demonstration: ${fileName}`).toString('base64')}`;
}

async function main() {
  for (const offer of offers) {
    await prisma.productOffer.upsert({
      where: { slug: offer.slug },
      update: {
        name: offer.name,
        productType: offer.productType,
        shortDescription: offer.shortDescription,
        longDescription: offer.longDescription,
        priceLabel: offer.priceLabel,
        durationLabel: offer.durationLabel,
        targetProfile: offer.targetProfile,
        minAge: 'minAge' in offer ? offer.minAge : null,
        maxAge: 'maxAge' in offer ? offer.maxAge : null,
        isActive: true,
        order: offer.order,
        benefits: {
          deleteMany: {},
          create: offer.benefits.map((label, index) => ({
            label,
            order: index + 1,
          })),
        },
        requiredDocuments: {
          deleteMany: {},
          create: offer.documents.map((document, index) => ({
            documentType: document.documentType,
            label: document.label,
            required: 'required' in document ? document.required : true,
            order: index + 1,
          })),
        },
      },
      create: {
        slug: offer.slug,
        name: offer.name,
        productType: offer.productType,
        shortDescription: offer.shortDescription,
        longDescription: offer.longDescription,
        priceLabel: offer.priceLabel,
        durationLabel: offer.durationLabel,
        targetProfile: offer.targetProfile,
        minAge: 'minAge' in offer ? offer.minAge : null,
        maxAge: 'maxAge' in offer ? offer.maxAge : null,
        isActive: true,
        order: offer.order,
        benefits: {
          create: offer.benefits.map((label, index) => ({
            label,
            order: index + 1,
          })),
        },
        requiredDocuments: {
          create: offer.documents.map((document, index) => ({
            documentType: document.documentType,
            label: document.label,
            required: 'required' in document ? document.required : true,
            order: index + 1,
          })),
        },
      },
    });
  }

  const passwordHash = await argon2.hash(demoUserPassword);
  const adminPasswordHash = await argon2.hash(adminPassword);

  await prisma.supportCase.deleteMany({
    where: {
      householdId: null,
      type: "FOUND_PASS",
      passNumberMasked: buildNavigoNumber("seed-found-pass"),
    },
  });

  const demoEmails = demoHouseholds.map((household) => household.email);
  const demoUsers = await prisma.user.findMany({
    where: { email: { in: demoEmails } },
    select: { id: true },
  });

  if (demoUsers.length) {
    await prisma.consent.deleteMany({
      where: { userId: { in: demoUsers.map((user) => user.id) } },
    });
    await prisma.household.deleteMany({
      where: { ownerId: { in: demoUsers.map((user) => user.id) } },
    });
  }

  const offerBySlug = Object.fromEntries(
    (await prisma.productOffer.findMany()).map((offer) => [offer.slug, offer]),
  );
  const householdsByName = new Map<
    string,
    Awaited<ReturnType<typeof prisma.household.create>>
  >();
  const membersByKey = new Map<
    string,
    Awaited<ReturnType<typeof prisma.householdMember.create>>
  >();

  for (const demoHousehold of demoHouseholds) {
    const user = await prisma.user.upsert({
      where: { email: demoHousehold.email },
      update: {
        firstName: demoHousehold.firstName,
        lastName: demoHousehold.lastName,
        phone: demoHousehold.phone,
        passwordHash,
        role: 'USER',
        phoneVerified: true,
        emailVerified: true,
      },
      create: {
        firstName: demoHousehold.firstName,
        lastName: demoHousehold.lastName,
        email: demoHousehold.email,
        phone: demoHousehold.phone,
        passwordHash,
        role: 'USER',
        phoneVerified: true,
        emailVerified: true,
      },
    });
    await prisma.consent.createMany({
      data: [
        { userId: user.id, type: 'SERVICE_ALERTS', accepted: true },
        {
          userId: user.id,
          type: 'MOBILITY_NEWS',
          accepted: demoHousehold.email !== 'bernard.dubois@example.com',
        },
        { userId: user.id, type: 'PARTNER_OFFERS', accepted: false },
      ],
    });

    const household = await prisma.household.create({
      data: {
        ownerId: user.id,
        name: demoHousehold.householdName,
      },
    });
    householdsByName.set(demoHousehold.householdName, household);

    for (const memberInput of demoHousehold.members) {
      const member = await prisma.householdMember.create({
        data: {
          householdId: household.id,
          firstName: memberInput.firstName,
          lastName: memberInput.lastName,
          birthDate: memberInput.birthDate
            ? dateAt(memberInput.birthDate, '00:00:00')
            : null,
          relationship: memberInput.relationship,
          profileType: memberInput.profileType,
          schoolLevel: memberInput.schoolLevel ?? null,
          department: memberInput.department ?? null,
          isHolder: memberInput.isHolder ?? true,
          isPayer: memberInput.isPayer ?? false,
          isLegalRepresentative: memberInput.isLegalRepresentative ?? false,
        },
      });
      membersByKey.set(memberInput.key, member);

      await prisma.memberProfileDetail.create({
        data: {
          householdMemberId: member.id,
          householdRole:
            member.profileType === 'MANAGER'
              ? 'Gestionnaire du foyer'
              : member.profileType === 'SENIOR'
                ? 'Profil senior accompagne'
                : member.schoolLevel === 'HIGHER_EDUCATION'
                  ? 'Profil etudiant'
                  : 'Porteur du titre',
          overview: `${member.firstName} ${member.lastName} dispose d'un profil de demonstration avec suivi des titres et justificatifs.`,
          supportNote: member.isPayer
            ? 'Profil payeur pouvant suivre les demandes et les alertes du foyer.'
            : `Payeur : ${demoHousehold.firstName} ${demoHousehold.lastName}.`,
          accessibilityNote:
            member.profileType === 'SENIOR'
              ? 'Parcours accompagne avec justificatifs verifies par un agent.'
              : null,
          documents:
            member.profileType === 'SENIOR'
              ? [
                  "Piece d'identite",
                  'Justificatif de situation',
                  'Justificatif de domicile',
                ]
              : member.schoolLevel
                ? ['Photo recente', "Piece d'identite", 'Certificat scolaire']
                : ["Piece d'identite", 'Moyen de paiement'],
          actions: {
            create: [
              {
                label: 'Voir les offres',
                href: `/dashboard/family/titles/recommendation?memberId=${member.id}`,
                variant: 'PRIMARY',
                order: 1,
              },
              {
                label: 'Voir le profil',
                href: `/dashboard/family/members/${member.id}`,
                variant: 'SECONDARY',
                order: 2,
              },
            ],
          },
        },
      });
    }

    await prisma.householdActivity.createMany({
      data: [
        {
          householdId: household.id,
          label: `Espace ${demoHousehold.householdName} cree pour la demonstration.`,
          createdAt: dateAt('2026-06-10', '08:30:00'),
        },
        ...demoHousehold.members.slice(1).map((member, index) => ({
          householdId: household.id,
          memberId: membersByKey.get(member.key)?.id,
          label: `${member.firstName} ${member.lastName} ajoute au foyer.`,
          createdAt: dateAt(
            '2026-06-10',
            `09:${String(index + 10).padStart(2, '0')}:00`,
          ),
        })),
      ],
    });
  }

  async function createRequest(input: {
    requestNumber: string;
    householdName: string;
    memberKey: string;
    payerKey?: string;
    offerSlug: string;
    status:
      | 'WAITING_DOCUMENTS'
      | 'UNDER_REVIEW'
      | 'PAYMENT_PENDING'
      | 'CONFIRMED'
      | 'ACTIVE'
      | 'BLOCKED'
      | 'REJECTED';
    createdAt: Date;
    submittedAt?: Date;
    reviewedAt?: Date;
    rejectionReason?: string;
    autoRenewalEnabled?: boolean;
    renewalType?: 'ANNUAL' | 'MONTHLY';
    renewalStatus?: 'ACTIVE' | 'DISABLED' | 'CANCELLED' | 'EXPIRED';
    renewalMonths?: number;
    renewalMonthsRemaining?: number;
    renewalNextDate?: Date;
    documents: Array<{
      documentType:
        | 'PHOTO'
        | 'SCHOOL_CERTIFICATE'
        | 'ID_DOCUMENT'
        | 'ADDRESS_PROOF'
        | 'SCHOLARSHIP_CERTIFICATE'
        | 'SITUATION_PROOF'
        | 'PAYMENT_METHOD';
      label: string;
      status:
        | 'MISSING'
        | 'UPLOADED'
        | 'UNDER_REVIEW'
        | 'VALIDATED'
        | 'REJECTED';
      fileName?: string;
      mimeType?: string;
      rejectionReason?: string;
      uploadedAt?: Date;
    }>;
    schoolName?: string;
    schoolZipOrCity?: string;
    schoolLevel?:
      | 'PRIMARY'
      | 'COLLEGE'
      | 'LYCEE'
      | 'HIGHER_EDUCATION'
      | 'OTHER';
    scholarshipStatus?: 'YES' | 'NO' | 'UNKNOWN';
  }) {
    const household = householdsByName.get(input.householdName);
    const member = membersByKey.get(input.memberKey);
    const payer = input.payerKey ? membersByKey.get(input.payerKey) : null;
    const offer = offerBySlug[input.offerSlug];

    if (!household || !member || !offer) {
      throw new Error(`Invalid seed request ${input.requestNumber}`);
    }

    const householdConfig = demoHouseholds.find(
      (candidate) => candidate.householdName === input.householdName,
    );

    return prisma.subscriptionRequest.create({
      data: {
        requestNumber: input.requestNumber,
        flowType: input.offerSlug.startsWith('imagine-r')
          ? 'IMAGINE_R'
          : 'GENERIC',
        householdId: household.id,
        memberId: member.id,
        payerMemberId: payer?.id ?? null,
        offerId: offer.id,
        status: input.status,
        customerNumber: `CLI-${input.requestNumber.slice(-5)}`,
        hasCustomerNumber: true,
        hasPreviousImagineR: [
          'lucas',
          'ines',
          'lucia',
          'noah',
          'yanis',
        ].includes(input.memberKey),
        infoCertificationAccepted: true,
        holderAddressSameAsPayer: true,
        schoolName: input.schoolName ?? null,
        schoolZipOrCity: input.schoolZipOrCity ?? null,
        imagineRSchoolLevel: input.schoolLevel ?? null,
        scholarshipStatus: input.scholarshipStatus ?? null,
        forfaitStartDate: dateAt('2026-09-01', '00:00:00'),
        validityStartDate: dateAt('2026-09-01', '00:00:00'),
        validityEndDate: dateAt('2027-08-31', '23:59:59'),
        deliveryMode: input.offerSlug.startsWith('imagine-r')
          ? 'PAYER_HOME'
          : null,
        baseAmountCents:
          input.offerSlug === 'imagine-r-junior'
            ? 2520
            : input.offerSlug.startsWith('imagine-r')
              ? 40130
              : 9080,
        feeAmountCents: input.offerSlug.startsWith('imagine-r') ? 800 : 0,
        totalAmountCents:
          input.offerSlug === 'imagine-r-junior'
            ? 3320
            : input.offerSlug.startsWith('imagine-r')
              ? 40930
              : 9080,
        autoRenewalEnabled: input.autoRenewalEnabled ?? false,
        renewalType: input.renewalType ?? null,
        renewalStatus: input.renewalStatus ?? 'DISABLED',
        renewalMonths: input.renewalMonths ?? null,
        renewalMonthsRemaining: input.renewalMonthsRemaining ?? null,
        renewalNextDate: input.renewalNextDate ?? null,
        renewalActivatedAt: input.autoRenewalEnabled ? input.createdAt : null,
        intelligentDossierEnabled: true,
        signatureInformationAccepted: [
          'PAYMENT_PENDING',
          'CONFIRMED',
          'ACTIVE',
        ].includes(input.status),
        signaturePayerAccepted: [
          'PAYMENT_PENDING',
          'CONFIRMED',
          'ACTIVE',
        ].includes(input.status),
        signatureTermsAccepted: [
          'PAYMENT_PENDING',
          'CONFIRMED',
          'ACTIVE',
        ].includes(input.status),
        signatureDocumentsAccepted: [
          'PAYMENT_PENDING',
          'CONFIRMED',
          'ACTIVE',
        ].includes(input.status),
        signedAt: ['PAYMENT_PENDING', 'CONFIRMED', 'ACTIVE'].includes(
          input.status,
        )
          ? (input.submittedAt ?? input.createdAt)
          : null,
        submittedAt: input.submittedAt ?? input.createdAt,
        reviewedAt: input.reviewedAt ?? null,
        rejectionReason: input.rejectionReason ?? null,
        createdAt: input.createdAt,
        updatedAt: input.reviewedAt ?? input.submittedAt ?? input.createdAt,
        addresses: householdConfig
          ? {
              create: [
                {
                  type: 'HOLDER',
                  street: householdConfig.address.street,
                  postalCode: householdConfig.address.postalCode,
                  city: householdConfig.address.city,
                },
                {
                  type: 'PAYER',
                  street: householdConfig.address.street,
                  postalCode: householdConfig.address.postalCode,
                  city: householdConfig.address.city,
                },
              ],
            }
          : undefined,
        documents: {
          create: input.documents.map((document, index) => ({
            documentType: document.documentType,
            label: document.label,
            status: document.status,
            rejectionReason: document.rejectionReason ?? null,
            simulatedFileName: document.fileName ?? null,
            simulatedMimeType:
              document.mimeType ??
              (document.fileName?.endsWith('.pdf')
                ? 'application/pdf'
                : document.fileName
                  ? 'image/jpeg'
                  : null),
            simulatedSizeBytes: document.fileName
              ? 180_000 + index * 24_000
              : null,
            simulatedPreviewDataUrl: document.fileName
              ? simulatedPreview(document.fileName)
              : null,
            uploadedAt: document.uploadedAt ?? null,
            createdAt: input.createdAt,
          })),
        },
      },
    });
  }

  const requests = {
    lucas: await createRequest({
      requestNumber: 'SUB-2026-LUCAS',
      householdName: 'Famille Martin',
      memberKey: 'lucas',
      payerKey: 'sophie',
      offerSlug: 'imagine-r-scolaire',
      status: 'UNDER_REVIEW',
      createdAt: dateAt('2026-06-11', '10:20:00'),
      submittedAt: dateAt('2026-06-12', '09:00:00'),
      autoRenewalEnabled: true,
      renewalType: 'ANNUAL',
      renewalStatus: 'ACTIVE',
      renewalNextDate: dateAt('2027-07-15', '00:00:00'),
      schoolName: 'College Paul Verlaine',
      schoolZipOrCity: 'Paris 12e',
      schoolLevel: 'COLLEGE',
      scholarshipStatus: 'NO',
      documents: [
        {
          documentType: 'PHOTO',
          label: 'Photo recente',
          status: 'VALIDATED',
          fileName: 'photo_lucas.png',
          mimeType: 'image/png',
          uploadedAt: dateAt('2026-06-11', '10:30:00'),
        },
        {
          documentType: 'ID_DOCUMENT',
          label: "Justificatif d'identite",
          status: 'UNDER_REVIEW',
          fileName: 'piece_identite_lucas.pdf',
          uploadedAt: dateAt('2026-06-11', '10:32:00'),
        },
        {
          documentType: 'SCHOOL_CERTIFICATE',
          label: 'Certificat scolaire',
          status: 'UPLOADED',
          fileName: 'certificat_scolarite_lucas.pdf',
          uploadedAt: dateAt('2026-06-12', '08:45:00'),
        },
      ],
    }),
    emma: await createRequest({
      requestNumber: 'SUB-2026-EMMA',
      householdName: 'Famille Martin',
      memberKey: 'emma',
      payerKey: 'sophie',
      offerSlug: 'imagine-r-junior',
      status: 'WAITING_DOCUMENTS',
      createdAt: dateAt('2026-06-14', '16:10:00'),
      autoRenewalEnabled: false,
      renewalStatus: 'DISABLED',
      schoolName: 'Ecole primaire Daumesnil',
      schoolZipOrCity: 'Paris 12e',
      schoolLevel: 'PRIMARY',
      documents: [
        { documentType: 'PHOTO', label: 'Photo recente', status: 'MISSING' },
        {
          documentType: 'ID_DOCUMENT',
          label: "Justificatif d'identite",
          status: 'MISSING',
        },
      ],
    }),
    ines: await createRequest({
      requestNumber: 'SUB-2026-INES',
      householdName: 'Famille Benali',
      memberKey: 'ines',
      payerKey: 'karim',
      offerSlug: 'imagine-r-scolaire',
      status: 'BLOCKED',
      createdAt: dateAt('2026-05-28', '14:15:00'),
      submittedAt: dateAt('2026-05-29', '08:40:00'),
      reviewedAt: dateAt('2026-06-03', '11:20:00'),
      rejectionReason: 'Photo non conforme.',
      schoolName: 'Lycee Suger',
      schoolZipOrCity: 'Saint-Denis',
      schoolLevel: 'LYCEE',
      scholarshipStatus: 'UNKNOWN',
      documents: [
        {
          documentType: 'PHOTO',
          label: 'Photo recente',
          status: 'REJECTED',
          fileName: 'photo_refusee_ines.jpg',
          rejectionReason: 'Photo floue.',
          uploadedAt: dateAt('2026-05-28', '14:20:00'),
        },
        {
          documentType: 'ID_DOCUMENT',
          label: "Justificatif d'identite",
          status: 'VALIDATED',
          fileName: 'piece_identite_ines.pdf',
          uploadedAt: dateAt('2026-05-28', '14:21:00'),
        },
        {
          documentType: 'SCHOOL_CERTIFICATE',
          label: 'Certificat scolaire',
          status: 'UNDER_REVIEW',
          fileName: 'certificat_scolarite_ines.pdf',
          uploadedAt: dateAt('2026-05-29', '08:40:00'),
        },
      ],
    }),
    marie: await createRequest({
      requestNumber: 'SUB-2026-MARIE',
      householdName: 'Famille Martin',
      memberKey: 'marie',
      payerKey: 'sophie',
      offerSlug: 'amethyste',
      status: 'UNDER_REVIEW',
      createdAt: dateAt('2026-06-02', '13:35:00'),
      submittedAt: dateAt('2026-06-03', '10:15:00'),
      documents: [
        {
          documentType: 'ID_DOCUMENT',
          label: "Piece d'identite",
          status: 'VALIDATED',
          fileName: 'piece_identite_marie.pdf',
          uploadedAt: dateAt('2026-06-02', '13:50:00'),
        },
        {
          documentType: 'SITUATION_PROOF',
          label: 'Justificatif de situation',
          status: 'UNDER_REVIEW',
          fileName: 'justificatif_situation_marie.pdf',
          uploadedAt: dateAt('2026-06-03', '10:10:00'),
        },
      ],
    }),
    leticia: await createRequest({
      requestNumber: 'SUB-2026-LETICIA',
      householdName: 'Foyer Leticia Moreau',
      memberKey: 'leticia',
      offerSlug: 'imagine-r-etudiant',
      status: 'PAYMENT_PENDING',
      createdAt: dateAt('2026-06-08', '18:05:00'),
      submittedAt: dateAt('2026-06-09', '09:30:00'),
      renewalStatus: 'DISABLED',
      schoolName: 'Universite Paris Cite',
      schoolZipOrCity: 'Paris',
      schoolLevel: 'HIGHER_EDUCATION',
      scholarshipStatus: 'YES',
      documents: [
        {
          documentType: 'PHOTO',
          label: 'Photo recente',
          status: 'VALIDATED',
          fileName: 'photo_leticia.jpg',
          uploadedAt: dateAt('2026-06-08', '18:10:00'),
        },
        {
          documentType: 'SCHOOL_CERTIFICATE',
          label: 'Certificat de scolarite',
          status: 'VALIDATED',
          fileName: 'certificat_scolarite_leticia.pdf',
          uploadedAt: dateAt('2026-06-08', '18:12:00'),
        },
        {
          documentType: 'SCHOLARSHIP_CERTIFICATE',
          label: 'Justificatif de bourse',
          status: 'UNDER_REVIEW',
          fileName: 'justificatif_bourse_leticia.pdf',
          uploadedAt: dateAt('2026-06-09', '09:20:00'),
        },
      ],
    }),
    julie: await createRequest({
      requestNumber: 'SUB-2026-JULIE',
      householdName: 'Foyer Julie Garnier',
      memberKey: 'julie',
      offerSlug: 'navigo-annuel',
      status: 'ACTIVE',
      createdAt: dateAt('2026-04-12', '09:00:00'),
      submittedAt: dateAt('2026-04-12', '09:20:00'),
      reviewedAt: dateAt('2026-04-13', '15:00:00'),
      autoRenewalEnabled: true,
      renewalType: 'ANNUAL',
      renewalStatus: 'ACTIVE',
      renewalNextDate: dateAt('2027-04-12', '00:00:00'),
      documents: [
        {
          documentType: 'ID_DOCUMENT',
          label: "Piece d'identite",
          status: 'VALIDATED',
          fileName: 'piece_identite_julie.pdf',
          uploadedAt: dateAt('2026-04-12', '09:10:00'),
        },
        {
          documentType: 'PAYMENT_METHOD',
          label: 'Mandat de paiement',
          status: 'VALIDATED',
          fileName: 'mandat_sepa_julie.pdf',
          uploadedAt: dateAt('2026-04-12', '09:11:00'),
        },
      ],
    }),
    bernard: await createRequest({
      requestNumber: 'SUB-2026-BERNARD',
      householdName: 'Foyer Bernard Dubois',
      memberKey: 'bernard',
      offerSlug: 'navigo-senior',
      status: 'CONFIRMED',
      createdAt: dateAt('2026-03-20', '10:00:00'),
      submittedAt: dateAt('2026-03-21', '10:00:00'),
      reviewedAt: dateAt('2026-03-24', '16:30:00'),
      renewalStatus: 'DISABLED',
      documents: [
        {
          documentType: 'ID_DOCUMENT',
          label: "Piece d'identite",
          status: 'VALIDATED',
          fileName: 'piece_identite_bernard.pdf',
          uploadedAt: dateAt('2026-03-20', '10:10:00'),
        },
        {
          documentType: 'SITUATION_PROOF',
          label: 'Justificatif de situation',
          status: 'VALIDATED',
          fileName: 'justificatif_retraite_bernard.pdf',
          uploadedAt: dateAt('2026-03-20', '10:12:00'),
        },
      ],
    }),
    noah: await createRequest({
      requestNumber: 'SUB-2026-NOAH',
      householdName: 'Famille Leroy',
      memberKey: 'noah',
      payerKey: 'thomas',
      offerSlug: 'imagine-r-scolaire',
      status: 'REJECTED',
      createdAt: dateAt('2026-05-18', '12:00:00'),
      submittedAt: dateAt('2026-05-18', '12:20:00'),
      reviewedAt: dateAt('2026-05-22', '09:45:00'),
      rejectionReason:
        'Nom/prenom incoherent entre le formulaire et le justificatif.',
      schoolName: 'College Hoche',
      schoolZipOrCity: 'Versailles',
      schoolLevel: 'COLLEGE',
      documents: [
        {
          documentType: 'PHOTO',
          label: 'Photo recente',
          status: 'VALIDATED',
          fileName: 'photo_noah.jpg',
          uploadedAt: dateAt('2026-05-18', '12:05:00'),
        },
        {
          documentType: 'ID_DOCUMENT',
          label: "Justificatif d'identite",
          status: 'REJECTED',
          fileName: 'piece_identite_noah.pdf',
          rejectionReason: 'Nom/prenom incoherent.',
          uploadedAt: dateAt('2026-05-18', '12:06:00'),
        },
        {
          documentType: 'SCHOOL_CERTIFICATE',
          label: 'Certificat scolaire',
          status: 'REJECTED',
          fileName: 'certificat_scolarite_noah.pdf',
          rejectionReason: 'Document illisible.',
          uploadedAt: dateAt('2026-05-18', '12:07:00'),
        },
      ],
    }),
    yanis: await createRequest({
      requestNumber: 'SUB-2026-YANIS',
      householdName: 'Famille Petit',
      memberKey: 'yanis',
      payerKey: 'nadia',
      offerSlug: 'imagine-r-scolaire',
      status: 'CONFIRMED',
      createdAt: dateAt('2026-06-05', '11:25:00'),
      submittedAt: dateAt('2026-06-05', '11:45:00'),
      reviewedAt: dateAt('2026-06-07', '14:20:00'),
      schoolName: 'Lycee Paul Lapie',
      schoolZipOrCity: 'Courbevoie',
      schoolLevel: 'LYCEE',
      documents: [
        {
          documentType: 'PHOTO',
          label: 'Photo recente',
          status: 'VALIDATED',
          fileName: 'photo_yanis.jpg',
          uploadedAt: dateAt('2026-06-05', '11:28:00'),
        },
        {
          documentType: 'ID_DOCUMENT',
          label: "Justificatif d'identite",
          status: 'VALIDATED',
          fileName: 'piece_identite_yanis.pdf',
          uploadedAt: dateAt('2026-06-05', '11:29:00'),
        },
        {
          documentType: 'SCHOOL_CERTIFICATE',
          label: 'Certificat scolaire',
          status: 'VALIDATED',
          fileName: 'certificat_scolarite_yanis.pdf',
          uploadedAt: dateAt('2026-06-05', '11:30:00'),
        },
      ],
    }),
  };

  async function createSubscription(input: {
    memberKey: string;
    productType:
      | 'NAVIGO_ANNUAL'
      | 'IMAGINE_R'
      | 'NAVIGO_JUNIOR'
      | 'NAVIGO_SENIOR'
      | 'AMETHYSTE';
    productName: string;
    sourceRequestId?: string;
    status?:
      | 'ACTIVE'
      | 'TO_RENEW'
      | 'RECOMMENDED'
      | 'PENDING_DOCUMENT'
      | 'BLOCKED'
      | 'LOST'
      | 'EXPIRED';
    renewalDate?: Date;
    nextActionLabel?: string;
  }) {
    const member = membersByKey.get(input.memberKey);
    if (!member)
      throw new Error(`Invalid subscription member ${input.memberKey}`);

    return prisma.subscription.create({
      data: {
        householdMemberId: member.id,
        productType: input.productType,
        productName: input.productName,
        sourceRequestId: input.sourceRequestId ?? null,
        status: input.status ?? 'ACTIVE',
        renewalDate: input.renewalDate ?? null,
        nextActionLabel: input.nextActionLabel ?? null,
      },
    });
  }

  await createSubscription({
    memberKey: 'sophie',
    productType: 'NAVIGO_ANNUAL',
    productName: 'Forfait Navigo Annuel',
    status: 'ACTIVE',
    renewalDate: dateAt('2026-12-15', '00:00:00'),
    nextActionLabel: 'Reconduction mensuelle active encore 6 mois',
  });
  await createSubscription({
    memberKey: 'lucas',
    productType: 'IMAGINE_R',
    productName: 'Imagine R Scolaire',
    sourceRequestId: requests.lucas.id,
    status: 'ACTIVE',
    renewalDate: dateAt('2027-07-15', '00:00:00'),
    nextActionLabel: 'Renouvellement automatique active',
  });
  await createSubscription({
    memberKey: 'emma',
    productType: 'NAVIGO_JUNIOR',
    productName: 'Imagine R Junior',
    sourceRequestId: requests.emma.id,
    status: 'PENDING_DOCUMENT',
    nextActionLabel: 'Photo et justificatif manquants',
  });
  await createSubscription({
    memberKey: 'bernard',
    productType: 'NAVIGO_SENIOR',
    productName: 'Navigo Senior',
    sourceRequestId: requests.bernard.id,
    status: 'ACTIVE',
    renewalDate: dateAt('2027-03-24', '00:00:00'),
    nextActionLabel: 'Renouvellement desactive',
  });
  await createSubscription({
    memberKey: 'leticia',
    productType: 'IMAGINE_R',
    productName: 'Imagine R Etudiant',
    sourceRequestId: requests.leticia.id,
    status: 'TO_RENEW',
    renewalDate: dateAt('2026-09-01', '00:00:00'),
    nextActionLabel: 'Renouvellement a confirmer',
  });
  await createSubscription({
    memberKey: 'julie',
    productType: 'NAVIGO_ANNUAL',
    productName: 'Forfait Navigo Annuel',
    sourceRequestId: requests.julie.id,
    status: 'ACTIVE',
    renewalDate: dateAt('2027-04-12', '00:00:00'),
    nextActionLabel: 'Paiement confirme',
  });
  await createSubscription({
    memberKey: 'yanis',
    productType: 'IMAGINE_R',
    productName: 'Imagine R Scolaire',
    sourceRequestId: requests.yanis.id,
    status: 'ACTIVE',
    renewalDate: dateAt('2027-07-15', '00:00:00'),
  });

  async function createPass(input: {
    memberKey: string;
    navigoNumber: string;
    productName: string;
    supportType: 'PHYSICAL' | 'DIGITAL';
    switches?: Array<{
      previousSupport: 'PHYSICAL' | 'DIGITAL';
      newSupport: 'PHYSICAL' | 'DIGITAL';
      createdAt: Date;
    }>;
  }) {
    const member = membersByKey.get(input.memberKey);
    if (!member) throw new Error(`Invalid pass member ${input.memberKey}`);

    return prisma.navigoPass.create({
      data: {
        householdMemberId: member.id,
        navigoNumber: input.navigoNumber,
        productName: input.productName,
        supportType: input.supportType,
        status: 'ACTIVE',
        supportSwitches: {
          create: input.switches ?? [],
        },
      },
    });
  }

  await createPass({
    memberKey: 'sophie',
    navigoNumber: '0 660 654 567 R',
    productName: 'Forfait Navigo Annuel',
    supportType: 'PHYSICAL',
  });
  await createPass({
    memberKey: 'lucas',
    navigoNumber: '0 660 654 568 S',
    productName: 'Imagine R Scolaire',
    supportType: 'PHYSICAL',
    switches: [
      {
        previousSupport: 'PHYSICAL',
        newSupport: 'DIGITAL',
        createdAt: currentMonthDate(4, 8),
      },
      {
        previousSupport: 'DIGITAL',
        newSupport: 'PHYSICAL',
        createdAt: currentMonthDate(10, 16),
      },
    ],
  });
  await createPass({
    memberKey: 'bernard',
    navigoNumber: '0 660 654 569 T',
    productName: 'Navigo Senior',
    supportType: 'PHYSICAL',
  });
  await createPass({
    memberKey: 'leticia',
    navigoNumber: '0 660 654 570 U',
    productName: 'Imagine R Etudiant',
    supportType: 'DIGITAL',
    switches: [
      {
        previousSupport: 'PHYSICAL',
        newSupport: 'DIGITAL',
        createdAt: currentMonthDate(7, 10),
      },
    ],
  });
  await createPass({
    memberKey: 'julie',
    navigoNumber: '0 660 654 571 V',
    productName: 'Forfait Navigo Annuel',
    supportType: 'DIGITAL',
  });
  await createPass({
    memberKey: 'yanis',
    navigoNumber: '0 660 654 572 W',
    productName: 'Imagine R Scolaire',
    supportType: 'DIGITAL',
    switches: [
      {
        previousSupport: 'PHYSICAL',
        newSupport: 'DIGITAL',
        createdAt: currentMonthDate(2, 9),
      },
      {
        previousSupport: 'DIGITAL',
        newSupport: 'PHYSICAL',
        createdAt: currentMonthDate(6, 10),
      },
      {
        previousSupport: 'PHYSICAL',
        newSupport: 'DIGITAL',
        createdAt: currentMonthDate(12, 11),
      },
    ],
  });

  const desks = {
    gareDeLyon: {
      name: 'Gare de Lyon',
      address: 'Place Louis-Armand, 75012 Paris',
    },
    chatelet: {
      name: 'Chatelet-Les Halles',
      address: '1 Place Marguerite de Navarre, 75001 Paris',
    },
    defense: {
      name: 'La Defense',
      address: 'Parvis de La Defense, 92400 Courbevoie',
    },
    saintDenis: {
      name: 'Saint-Denis Universite',
      address: '2 Rue Guynemer, 93200 Saint-Denis',
    },
    versailles: {
      name: 'Versailles Chantiers',
      address: "4 Rue de l'Abbe Rousseaux, 78000 Versailles",
    },
  };

  async function createSupportCase(input: {
    householdName?: string;
    memberKey?: string;
    type: 'LOST_PASS' | 'FOUND_PASS';
    status:
      | 'OPEN'
      | 'IN_PROGRESS'
      | 'TRANSFER_TO_PHONE_REQUESTED'
      | 'PASS_DEACTIVATION_REQUESTED'
      | 'PASS_FOUND_WAITING_PICKUP'
      | 'PASS_PICKED_UP'
      | 'DIGITAL_SUPPORT_CONFIRMED'
      | 'PHYSICAL_PASS_REACTIVATION_REQUESTED'
      | 'PHYSICAL_PASS_REACTIVATED'
      | 'RESOLVED'
      | 'CANCELLED_BY_USER';
    reason?: string;
    chosenResolution?: 'TRANSFER_TO_PHONE' | 'DEACTIVATE_ONLY';
    finalChoice?: 'DIGITAL_SUPPORT' | 'PHYSICAL_PASS_REACTIVATION';
    description: string;
    passNumberMasked: string;
    desk?: { name: string; address: string };
    foundAt?: Date;
    clientNotifiedAt?: Date;
    pickedUpAt?: Date;
    finalChoiceAt?: Date;
    resolvedAt?: Date;
    digitalSupportRating?: number;
    createdAt: Date;
  }) {
    const household = input.householdName
      ? householdsByName.get(input.householdName)
      : null;
    const member = input.memberKey ? membersByKey.get(input.memberKey) : null;

    return prisma.supportCase.create({
      data: {
        householdId: household?.id ?? null,
        memberId: member?.id ?? null,
        type: input.type,
        status: input.status,
        reason: input.reason ?? null,
        chosenResolution: input.chosenResolution ?? null,
        finalChoice: input.finalChoice ?? null,
        description: input.description,
        passNumberMasked: input.passNumberMasked,
        foundLocation: input.desk
          ? `${input.desk.name} - ${input.desk.address}`
          : null,
        foundDeskName: input.desk?.name ?? null,
        foundDeskAddress: input.desk?.address ?? null,
        foundAt: input.foundAt ?? null,
        depositedAtDesk:
          input.type === 'FOUND_PASS' ||
          input.status === 'PASS_FOUND_WAITING_PICKUP',
        clientNotifiedAt: input.clientNotifiedAt ?? null,
        pickedUpAt: input.pickedUpAt ?? null,
        finalChoiceAt: input.finalChoiceAt ?? null,
        pickupDeadlineAt: input.foundAt ? addDays(input.foundAt, 14) : null,
        resolvedAt: input.resolvedAt ?? null,
        digitalSupportRating: input.digitalSupportRating ?? null,
        createdAt: input.createdAt,
        updatedAt:
          input.resolvedAt ??
          input.finalChoiceAt ??
          input.pickedUpAt ??
          input.clientNotifiedAt ??
          input.createdAt,
      },
    });
  }

  await createSupportCase({
    householdName: 'Famille Martin',
    memberKey: 'lucas',
    type: 'LOST_PASS',
    status: 'TRANSFER_TO_PHONE_REQUESTED',
    reason: 'LOST',
    chosenResolution: 'TRANSFER_TO_PHONE',
    description:
      'Perte declaree dans le bus 64, transfert numerique temporaire demande.',
    passNumberMasked: '0 660 654 568 S',
    createdAt: dateAt('2026-06-15', '07:45:00'),
    digitalSupportRating: 9,
  });
  await createSupportCase({
    householdName: 'Famille Benali',
    memberKey: 'ines',
    type: 'LOST_PASS',
    status: 'PASS_FOUND_WAITING_PICKUP',
    reason: 'LOST',
    description: 'Pass retrouve et disponible au guichet Gare de Lyon.',
    passNumberMasked: '0 660 222 415 K',
    desk: desks.gareDeLyon,
    foundAt: dateAt('2026-06-18', '10:00:00'),
    clientNotifiedAt: dateAt('2026-06-18', '10:30:00'),
    createdAt: dateAt('2026-06-17', '18:10:00'),
  });
  await createSupportCase({
    householdName: 'Foyer Bernard Dubois',
    memberKey: 'bernard',
    type: 'LOST_PASS',
    status: 'PASS_DEACTIVATION_REQUESTED',
    reason: 'LOST',
    chosenResolution: 'DEACTIVATE_ONLY',
    description: 'Desactivation du pass physique et demande de nouvelle carte.',
    passNumberMasked: '0 660 654 569 T',
    createdAt: dateAt('2026-06-09', '12:15:00'),
    digitalSupportRating: 6,
  });
  await createSupportCase({
    householdName: 'Foyer Leticia Moreau',
    memberKey: 'leticia',
    type: 'LOST_PASS',
    status: 'DIGITAL_SUPPORT_CONFIRMED',
    reason: 'LOST',
    chosenResolution: 'TRANSFER_TO_PHONE',
    finalChoice: 'DIGITAL_SUPPORT',
    description: 'Pass definitivement bascule en support numerique.',
    passNumberMasked: '0 660 654 570 U',
    finalChoiceAt: dateAt('2026-06-13', '17:45:00'),
    resolvedAt: dateAt('2026-06-13', '17:50:00'),
    createdAt: dateAt('2026-06-12', '08:25:00'),
    digitalSupportRating: 8,
  });
  await createSupportCase({
    type: 'FOUND_PASS',
    status: 'OPEN',
    description: 'Pass retrouve sans declaration active correspondante.',
    passNumberMasked: '0 660 111 999 Q',
    desk: desks.chatelet,
    foundAt: dateAt('2026-06-18', '09:20:00'),
    createdAt: dateAt('2026-06-18', '09:25:00'),
  });
  await createSupportCase({
    householdName: 'Famille Leroy',
    memberKey: 'chloe',
    type: 'LOST_PASS',
    status: 'PASS_PICKED_UP',
    reason: 'FOUND',
    description: 'Pass recupere au guichet, choix final a faire.',
    passNumberMasked: '0 660 333 882 L',
    desk: desks.versailles,
    foundAt: dateAt('2026-06-07', '15:00:00'),
    pickedUpAt: dateAt('2026-06-09', '17:20:00'),
    createdAt: dateAt('2026-06-06', '19:30:00'),
  });
  await createSupportCase({
    householdName: 'Famille Petit',
    memberKey: 'yanis',
    type: 'LOST_PASS',
    status: 'PHYSICAL_PASS_REACTIVATED',
    reason: 'FOUND',
    chosenResolution: 'TRANSFER_TO_PHONE',
    finalChoice: 'PHYSICAL_PASS_REACTIVATION',
    description: 'Support physique reactive apres recuperation.',
    passNumberMasked: '0 660 654 572 W',
    desk: desks.defense,
    foundAt: dateAt('2026-06-03', '12:05:00'),
    pickedUpAt: dateAt('2026-06-04', '18:00:00'),
    finalChoiceAt: dateAt('2026-06-05', '09:10:00'),
    resolvedAt: dateAt('2026-06-05', '09:15:00'),
    createdAt: dateAt('2026-06-02', '07:50:00'),
    digitalSupportRating: 7,
  });

  await prisma.supportCase.create({
    data: {
      type: 'FOUND_PASS',
      status: 'OPEN',
      description:
        'Pass etudiant retrouve pres du campus et depose au guichet.',
      passNumberMasked: '0 660 999 123 X',
      foundLocation: `${desks.saintDenis.name} - ${desks.saintDenis.address}`,
      foundDeskName: desks.saintDenis.name,
      foundDeskAddress: desks.saintDenis.address,
      foundAt: dateAt('2026-06-16', '14:30:00'),
      depositedAtDesk: true,
      createdAt: dateAt('2026-06-16', '14:35:00'),
    },
  });

  const notifications = [
    {
      household: 'Famille Benali',
      member: 'ines',
      type: 'SUPPORT_UPDATE',
      severity: 'DANGER',
      title: 'Document refuse',
      message: "La photo d'Ines est floue. Une nouvelle photo est attendue.",
      createdAt: dateAt('2026-06-03', '11:25:00'),
    },
    {
      household: 'Famille Benali',
      member: 'ines',
      type: 'SUPPORT_UPDATE',
      severity: 'SUCCESS',
      title: 'Pass retrouve',
      message: "Le pass d'Ines attend au guichet Gare de Lyon.",
      createdAt: dateAt('2026-06-18', '10:35:00'),
    },
    {
      household: 'Famille Martin',
      member: 'lucas',
      type: 'RENEWAL',
      severity: 'INFO',
      title: 'Renouvellement a venir',
      message:
        'Le renouvellement automatique de Lucas est active pour la prochaine rentree.',
      createdAt: dateAt('2026-06-12', '09:15:00'),
    },
    {
      household: 'Famille Petit',
      member: 'yanis',
      type: 'SERVICE_INFO',
      severity: 'SUCCESS',
      title: 'Demande validee',
      message:
        'La demande Imagine R de Yanis est validee et le paiement est confirme.',
      createdAt: dateAt('2026-06-07', '14:30:00'),
    },
    {
      household: 'Foyer Julie Garnier',
      member: 'julie',
      type: 'SERVICE_INFO',
      severity: 'SUCCESS',
      title: 'Paiement confirme',
      message: 'Le paiement du Navigo Annuel est confirme.',
      createdAt: dateAt('2026-04-13', '15:05:00'),
    },
    {
      household: 'Famille Martin',
      member: 'emma',
      type: 'OFFER_RECOMMENDATION',
      severity: 'WARNING',
      title: 'Justificatifs attendus',
      message:
        "La photo et le justificatif d'identite d'Emma sont encore manquants.",
      createdAt: dateAt('2026-06-14', '16:20:00'),
    },
  ] as const;

  await prisma.familyNotification.createMany({
    data: notifications.map((notification) => ({
      householdId: householdsByName.get(notification.household)!.id,
      memberId: membersByKey.get(notification.member)?.id,
      type: notification.type,
      severity: notification.severity,
      title: notification.title,
      message: notification.message,
      createdAt: notification.createdAt,
    })),
  });

  await prisma.householdActivity.createMany({
    data: [
      {
        householdId: householdsByName.get('Famille Martin')!.id,
        memberId: membersByKey.get('lucas')!.id,
        label: 'Demande Imagine R Scolaire deposee pour Lucas.',
        createdAt: dateAt('2026-06-12', '09:00:00'),
      },
      {
        householdId: householdsByName.get('Famille Martin')!.id,
        memberId: membersByKey.get('emma')!.id,
        label: 'Dossier Emma en attente de justificatifs.',
        createdAt: dateAt('2026-06-14', '16:20:00'),
      },
      {
        householdId: householdsByName.get('Famille Benali')!.id,
        memberId: membersByKey.get('ines')!.id,
        label: "Document refuse sur le dossier d'Ines.",
        createdAt: dateAt('2026-06-03', '11:25:00'),
      },
      {
        householdId: householdsByName.get('Foyer Leticia Moreau')!.id,
        memberId: membersByKey.get('leticia')!.id,
        label: 'Avis Leticia 4/5 : Le pass numerique est pratique.',
        createdAt: dateAt('2026-06-13', '17:55:00'),
      },
      {
        householdId: householdsByName.get('Famille Garcia')!.id,
        memberId: membersByKey.get('elena')!.id,
        label: 'Avis Elena 5/5 : Les etapes sont simples a comprendre.',
        createdAt: dateAt('2026-06-11', '12:00:00'),
      },
      {
        householdId: householdsByName.get('Famille Martin')!.id,
        memberId: membersByKey.get('sophie')!.id,
        label:
          'Avis Sophie 5/5 : Gestion du forfait de Lucas sans appel service client.',
        createdAt: dateAt('2026-06-12', '12:00:00'),
      },
      {
        householdId: householdsByName.get('Famille Benali')!.id,
        memberId: membersByKey.get('karim')!.id,
        label: 'Avis Karim 4/5 : Le suivi du dossier est clair.',
        createdAt: dateAt('2026-06-04', '12:00:00'),
      },
      {
        householdId: householdsByName.get('Foyer Bernard Dubois')!.id,
        memberId: membersByKey.get('bernard')!.id,
        label: "Avis Bernard 3/5 : Besoin d'aide pour les documents.",
        createdAt: dateAt('2026-06-10', '12:00:00'),
      },
    ],
  });

  await prisma.memberProfileDetail.create({
    data: {
      householdMemberId: manager.id,
      householdRole: "Gestionnaire du foyer",
      overview: "Votre espace centralise les profils, les paiements et les prochaines actions du foyer.",
      supportNote: "Vous etes le point d'entree principal pour le suivi des dossiers et des alertes.",
      accessibilityNote: null,
      documents: ["Pièce d'identité", "Moyen de paiement si souscription"],
      actions: {
        create: [
          {
            label: "Trouver une offre",
            href: `/dashboard/family/titles/recommendation?memberId=${manager.id}`,
            variant: "PRIMARY",
            order: 1,
          },
          {
            label: "Attestation employeur",
            href: "/dashboard/family",
            variant: "SECONDARY",
            order: 2,
          },
        ],
      },
    },
  });

  await prisma.memberProfileDetail.create({
    data: {
      householdMemberId: child.id,
      householdRole: "Porteur du titre",
      overview: "Lucas n'a pas encore de titre rattaché. Vous pouvez choisir l'offre adaptée avant souscription.",
      supportNote: "Payeur : Sophie Martin. Documents probables : photo récente et certificat scolaire.",
      accessibilityNote: null,
      documents: ["Photo recente", "Certificat scolaire", "Piece d'identite si demandee"],
      actions: {
        create: [
          {
            label: "Trouver une offre",
            href: `/dashboard/family/titles/recommendation?memberId=${child.id}`,
            variant: "PRIMARY",
            order: 1,
          },
          {
            label: "Voir les justificatifs",
            href: `/dashboard/family/members/${child.id}#documents`,
            variant: "SECONDARY",
            order: 2,
          },
        ],
      },
    },
  });

  await prisma.memberProfileDetail.create({
    data: {
      householdMemberId: senior.id,
      householdRole: "Profil senior accompagné",
      overview: "Marie n'a pas encore de titre rattaché. Une vérification peut orienter vers Navigo Senior ou Améthyste.",
      supportNote: "Gestionnaire : Sophie Martin. Les justificatifs dépendront de l'offre retenue.",
      accessibilityNote: "Le parcours senior reste accompagné et peut être repris plus tard.",
      documents: ["Pièce d'identité", "Justificatif de domicile", "Justificatif de situation si demandé"],
      actions: {
        create: [
          {
            label: "Vérifier l'offre adaptée",
            href: `/dashboard/family/titles/recommendation?memberId=${senior.id}`,
            variant: "PRIMARY",
            order: 1,
          },
          {
            label: "Voir le profil",
            href: `/dashboard/family/members/${senior.id}`,
            variant: "SECONDARY",
            order: 2,
          },
        ],
      },
    },
  });

  await prisma.consent.createMany({
    data: [
      { userId: user.id, type: "SERVICE_ALERTS", accepted: true },
      { userId: user.id, type: "MOBILITY_NEWS", accepted: false },
      { userId: user.id, type: "PARTNER_OFFERS", accepted: false },
    ],
  });

  await prisma.supportCase.create({
    data: {
      householdId: household.id,
      memberId: child.id,
      type: "LOST_PASS",
      status: "PASS_DEACTIVATION_REQUESTED",
      reason: "LOST",
      chosenResolution: "REPLACEMENT_CARD",
      passNumberMasked: buildNavigoNumber(child.id),
      description: "Passe perdu déclaré depuis l'espace famille.",
      createdAt: new Date("2026-06-16T11:00:00.000Z"),
    },
  });

  await prisma.supportCase.create({
    data: {
      type: "FOUND_PASS",
      status: "OPEN",
      passNumberMasked: buildNavigoNumber("seed-found-pass"),
      foundLocation: "Gare de Lyon - guichet services",
      depositedAtDesk: true,
      createdAt: new Date("2026-06-16T11:30:00.000Z"),
    },
  });

  await prisma.householdActivity.create({
    data: {
      householdId: household.id,
      memberId: child.id,
      label: "Passe perdu déclaré pour Lucas.",
      createdAt: new Date("2026-06-16T11:00:00.000Z"),
    },
  });

  for (const admin of adminAccounts) {
    await prisma.user.upsert({
      where: { email: admin.email },
      update: {
        firstName: admin.firstName,
        lastName: admin.lastName,
        phone: admin.phone,
        passwordHash: adminPasswordHash,
        role: 'ADMIN',
        phoneVerified: true,
        emailVerified: true,
      },
      create: {
        firstName: admin.firstName,
        lastName: admin.lastName,
        email: admin.email,
        phone: admin.phone,
        passwordHash: adminPasswordHash,
        role: 'ADMIN',
        phoneVerified: true,
        emailVerified: true,
      },
    });
  }

  console.log(`Seeded ${demoHouseholds.length} demo households`);
  console.log(
    `Seeded ${adminAccounts.length} admin accounts with password ${adminPassword}`,
  );
}

main()
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  })
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
