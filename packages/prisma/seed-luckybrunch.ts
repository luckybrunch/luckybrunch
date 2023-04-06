import prisma from ".";

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

export default async function main() {
  await seedLuckyBrunchData();
}

async function seedLuckyBrunchData() {
  await seedCertificateTypes();
  await seedSpecilazations();
}

async function seedCertificateTypes() {
  const certypes = [
    { id: 1, name: "Ernährungsberater/DGE, Ernährungsmedizinischer Berater/DGE" },
    { id: 2, name: "VDD-Fortbildungszertifikat" },
    { id: 3, name: "Zertifikat Ernährungsberater VDOE" },
    { id: 4, name: "VFED-Zertifizierung" },
    { id: 5, name: "QUETHEB-Registrierung" },
    { id: 6, name: "Ernährungsberater UGB" },
    { id: 7, name: "Ernährungsmediziner (BDEM/DGEM)" },
  ];

  for (const certype of certypes) {
    await prisma.certificateType.upsert({
      where: { id: certype.id },
      update: { name: certype.name },
      create: certype,
    });
  }

  console.log(`🎓 Upserted ${certypes.length} certificate types`);
}

async function seedSpecilazations() {
  const specializations = [
    //Ernährungstherapie
    { id: 1, label: "Ernährungsberater/DGE, Ernährungsmedizinischer Berater/DGE" },
    { id: 2, label: "VDD-Fortbildungszertifikat" },
    { id: 3, label: "Zertifikat Ernährungsberater VDOE" },
    { id: 4, label: "VFED-Zertifizierung" },
    { id: 5, label: "QUETHEB-Registrierung" },
    { id: 6, label: "Fettstoffwechselstörung" },
    { id: 8, label: "Fettleber | Leberzirrhose | Hepatitis" },
    { id: 9, label: "Gastritis" },
    { id: 10, label: "Herzinsuffizienz" },
    { id: 11, label: "Hypertonie" },
    { id: 12, label: "Hyperurikämie | Gicht" },
    { id: 13, label: "	Nahrungsmittelallergie" },
    { id: 14, label: "Nahrungsmittelintoleranz | Unverträglichkeit" },
    { id: 15, label: "Nephrologische Erkrankungen" },
    { id: 16, label: "Onkologische Erkrankungen" },
    { id: 17, label: "Pankreaserkrankungen" },
    { id: 18, label: "Rheuma" },
    { id: 19, label: "Schilddrüsenerkrankung" },
    { id: 20, label: "Untergewicht | Mangelernährung" },
    { id: 21, label: "Glutenunverträglichkeit" },
    { id: 22, label: "Sonstiges" },
    //Präventive Ernährungsberatung
    { id: 23, label: "Sportlerernährung" },
    { id: 24, label: "Stärkung des Immunsystems" },
    { id: 25, label: "Ernährung für Senioren" },
    //Ernährungsbildung / Betriebliche Gesundheitsförderung
    { id: 26, label: "Ernährungsberatung im Rahmen des betrieblichen Gesundheitsmanagements" },
    { id: 27, label: "Kindergärten und Schulen" },
    { id: 28, label: "Vereine und Selbsthilfegruppen" },
  ];

  for (const item of specializations) {
    await prisma.specialization.upsert({
      where: { id: item.id },
      update: { label: item.label },
      create: item,
    });
  }

  console.log(`🎨 Upserted ${specializations.length} specializations`);
}
