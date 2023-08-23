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
    { id: 1, label: "Unter- und Übergewicht" },
    { id: 2, label: "Erkrankungen des Verdauungssystems" },
    { id: 3, label: "Herz-Kreislauferkrankungen" },
    { id: 4, label: "Stoffwechselerkrankungen" },
    { id: 5, label: "Allergien und Intoleranzen" },
    { id: 6, label: "Schwangere und Kinderernährung" },
    { id: 7, label: "Sportlerernährung" },
    { id: 8, label: "Alternative Ernährungsformen" },
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
