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
    // Ernährungstherapie
    { id: 1, label: "Adipositas | Übergewicht" },
    { id: 2, label: "Arteriosklerose | KHK" },
    { id: 3, label: "Darmerkrankungen" },
    { id: 4, label: "Diabetes Typ 1 oder 2" },
    { id: 5, label: "Essstörung" },
    { id: 6, label: "Fettstoffwechselstörung" },
    { id: 7, label: "Fettleber | Leberzirrhose | Hepatitis" },
    { id: 8, label: "Gastritis" },
    { id: 9, label: "Herzinsuffizienz" },
    { id: 10, label: "Hypertonie" },
    { id: 11, label: "Hyperurikämie | Gicht" },
    { id: 12, label: "Nahrungsmittelallergie" },
    { id: 13, label: "Nahrungsmittelintoleranz | Unverträglichkeit" },
    { id: 14, label: "Nephrologische Erkrankungen" },
    { id: 15, label: "Onkologische Erkrankungen" },
    { id: 16, label: "Pankreaserkrankungen" },
    { id: 17, label: "Rheuma" },
    { id: 18, label: "Schilddrüsenerkrankung" },
    { id: 19, label: "Untergewicht | Mangelernährung" },
    { id: 20, label: "Glutenunverträglichkeit" },
    { id: 21, label: "Sonstiges" },
    // Präventive Ernährungsberatung
    { id: 22, label: "Sportlerernährung" },
    { id: 23, label: "Stärkung des Immunsystems" },
    { id: 24, label: "Übergewicht bzw. Gewichtszunahme" },
    { id: 25, label: "Ernährung von Kindern und Kleinkindern" },
    { id: 26, label: "Ernährung für Senioren" },
    // Ernährungsbildung / Betriebliche Gesundheitsförderung
    { id: 27, label: "Ernährungsberatung im Rahmen des betrieblichen Gesundheitsmanagements" },
    { id: 28, label: "Kindergärten und Schulen" },
    { id: 29, label: "Vereine und Selbsthilfegruppen" },
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
