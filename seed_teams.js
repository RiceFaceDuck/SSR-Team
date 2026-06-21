async function update() {
  const teamsToUpdate = [
    {
      id: "arsenal",
      name: "Arsenal",
      shortName: "ARS",
      logo: "https://drive.google.com/uc?export=view&id=1UFrRRvrILn1S-bBj3XBMsZNQxW14jYi4"
    },
    {
      id: "aston-villa",
      name: "Aston Villa",
      shortName: "AVL",
      logo: "https://drive.google.com/uc?export=view&id=1lQEXj54RM2fAv6L-HRGwUQ8TDD2TiQME"
    },
    {
      id: "bournemouth",
      name: "Bournemouth",
      shortName: "BOU",
      logo: "https://drive.google.com/uc?export=view&id=1myTvy4Ve-L3VPrrKkpofFaT-GzDRbXOJ"
    }
  ];

  for (const team of teamsToUpdate) {
    const url = `https://firestore.googleapis.com/v1/projects/ssr-team/databases/(default)/documents/artifacts/ssr-team/public/data/teams/${team.id}?updateMask.fieldPaths=logo&updateMask.fieldPaths=name&updateMask.fieldPaths=shortName`;
    const body = {
      name: `projects/ssr-team/databases/(default)/documents/artifacts/ssr-team/public/data/teams/${team.id}`,
      fields: {
        logo: { stringValue: team.logo },
        name: { stringValue: team.name },
        shortName: { stringValue: team.shortName }
      }
    };
    try {
      const res = await fetch(url, { method: "PATCH", body: JSON.stringify(body) });
      console.log(`Updated ${team.name}:`, await res.status);
    } catch(e) {
      console.error(e);
    }
  }
}
update();
