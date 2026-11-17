import prisma from "../config/prisma.js";
import { hashPassword } from "../utils/password.js";

async function main() {
  console.log("🌱 Starting ActorsGlobe database seed...");

  const defaultPassword = "Password123!";
  const adminPassword = "AdminPass123!";
  const passwordHash = await hashPassword(defaultPassword);
  const adminPasswordHash = await hashPassword(adminPassword);

  // 1. Seed Demo Actor User
  console.log("🎭 Seeding Demo Actor...");
  const actorUser = await prisma.user.upsert({
    where: { email: "actor@actorsglobe.com" },
    update: {
      passwordHash,
      emailVerified: true,
      phoneVerified: true,
      isActive: true
    },
    create: {
      name: "Lewis Daller",
      email: "actor@actorsglobe.com",
      phone: "+15551234567",
      passwordHash,
      role: "ACTOR",
      emailVerified: true,
      phoneVerified: true,
      isActive: true
    }
  });

  const actorProfile = await prisma.actorProfile.upsert({
    where: { userId: actorUser.id },
    update: {
      displayName: "Lewis Daller",
      bio: "Classical & contemporary stage and screen actor. Trained at RADA, 8+ years experience in feature dramas, period pieces, and voiceover.",
      skills: ["ACTING", "VOICE_ACTING", "ACCENT_IMPERSONATION", "MARTIAL_ARTS"]
    },
    create: {
      userId: actorUser.id,
      displayName: "Lewis Daller",
      dateOfBirth: new Date("1995-04-12T00:00:00.000Z"),
      gender: "MALE",
      sexualOrientation: "STRAIGHT",
      bio: "Classical & contemporary stage and screen actor. Trained at RADA, 8+ years experience in feature dramas, period pieces, and voiceover.",
      skills: ["ACTING", "VOICE_ACTING", "ACCENT_IMPERSONATION", "MARTIAL_ARTS"]
    }
  });

  // Ensure Experience for Actor
  const existingExp = await prisma.experience.findFirst({
    where: { actorId: actorProfile.id }
  });
  if (!existingExp) {
    await prisma.experience.create({
      data: {
        actorId: actorProfile.id,
        roleTitle: "Lead Protagonist - Arthur",
        organization: "Blackwood Independent Pictures",
        description: "Featured in 90-minute indie psychological thriller filmed on location in London.",
        startDate: new Date("2023-01-15T00:00:00.000Z"),
        isCurrent: false
      }
    });
  }

  // 2. Seed Demo Caster User
  console.log("🎬 Seeding Demo Caster...");
  const casterUser = await prisma.user.upsert({
    where: { email: "caster@actorsglobe.com" },
    update: {
      passwordHash,
      emailVerified: true,
      phoneVerified: true,
      isActive: true
    },
    create: {
      name: "Elena Rostova",
      email: "caster@actorsglobe.com",
      phone: "+15559876543",
      passwordHash,
      role: "CASTER",
      emailVerified: true,
      phoneVerified: true,
      isActive: true
    }
  });

  const casterProfile = await prisma.casterProfile.upsert({
    where: { userId: casterUser.id },
    update: {
      displayName: "Auteur Casting Studio",
      bio: "Boutique casting director and production studio representing award-winning independent films across Europe and North America."
    },
    create: {
      userId: casterUser.id,
      displayName: "Auteur Casting Studio",
      bio: "Boutique casting director and production studio representing award-winning independent films across Europe and North America."
    }
  });

  // 3. Seed Projects & Roles for Caster
  console.log("📽️ Seeding Sample Projects & Roles...");
  const existingProject = await prisma.project.findFirst({
    where: { casterId: casterProfile.id, title: "The Silver Monograph" }
  });

  let role1Id: string | null = null;
  if (!existingProject) {
    const project1 = await prisma.project.create({
      data: {
        casterId: casterProfile.id,
        title: "The Silver Monograph",
        description: "An atmospheric psychological drama exploring an archivist who uncovers lost 1930s film negatives in Paris.",
        projectType: "FEATURE_FILM",
        location: "London & Paris",
        status: "PUBLISHED",
        castingRoles: {
          create: [
            {
              title: "Henri - Lead Archivist",
              description: "30s, intense, emotionally reserved archivist with a passion for vintage analog film.",
              genderRequirement: "MALE",
              minAge: 28,
              maxAge: 40,
              status: "OPEN"
            },
            {
              title: "Claire - Gallery Curator",
              description: "Mid 30s to 40s, sharp, discerning art historian with high editorial standards.",
              genderRequirement: "FEMALE",
              minAge: 32,
              maxAge: 45,
              status: "OPEN"
            }
          ]
        }
      },
      include: {
        castingRoles: true
      }
    });
    role1Id = project1.castingRoles[0]?.id || null;
  } else {
    const role = await prisma.castingRole.findFirst({
      where: { projectId: existingProject.id }
    });
    role1Id = role?.id || null;
  }

  const existingProject2 = await prisma.project.findFirst({
    where: { casterId: casterProfile.id, title: "Echoes of Solitude" }
  });

  if (!existingProject2) {
    await prisma.project.create({
      data: {
        casterId: casterProfile.id,
        title: "Echoes of Solitude",
        description: "A visual sci-fi short film set on an orbital sanctuary station.",
        projectType: "SHORT_FILM",
        location: "Studio Stage 4, Bristol",
        status: "PUBLISHED",
        castingRoles: {
          create: [
            {
              title: "Commander Veda",
              description: "Calculated, stoic station commander confronting an unexpected transmission.",
              genderRequirement: "ANY",
              minAge: 25,
              maxAge: 50,
              status: "OPEN"
            }
          ]
        }
      }
    });
  }

  // 4. Seed Demo Application
  if (role1Id) {
    const existingApp = await prisma.application.findUnique({
      where: {
        actorId_castingRoleId: {
          actorId: actorProfile.id,
          castingRoleId: role1Id
        }
      }
    });

    if (!existingApp) {
      await prisma.application.create({
        data: {
          actorId: actorProfile.id,
          castingRoleId: role1Id,
          status: "PENDING"
        }
      });
      console.log("📝 Seeded initial audition application.");
    }
  }

  // 5. Seed Demo Admin Account
  console.log("🛡️ Seeding Demo Admin Account...");
  await prisma.admin.upsert({
    where: { email: "admin@actorsglobe.com" },
    update: {
      passwordHash: adminPasswordHash,
      name: "Platform Trust & Safety Admin"
    },
    create: {
      name: "Platform Trust & Safety Admin",
      email: "admin@actorsglobe.com",
      passwordHash: adminPasswordHash
    }
  });

  // 6. Seed Demo Moderation Report
  const existingReport = await prisma.report.findFirst({
    where: { targetId: actorUser.id }
  });

  if (!existingReport) {
    await prisma.report.create({
      data: {
        reporterId: casterUser.id,
        reportedUserId: actorUser.id,
        targetType: "USER",
        targetId: actorUser.id,
        reason: "Test inquiry regarding audition format standards",
        description: "Demo report for testing trust & safety moderation and resolution flow.",
        status: "PENDING"
      }
    });
    console.log("⚖️ Seeded initial moderation report.");
  }

  console.log("\n=======================================================");
  console.log("🎉 Database Seed Completed Successfully!");
  console.log("=======================================================");
  console.log("👤 ACTOR ACCOUNT:");
  console.log("   Email:    actor@actorsglobe.com");
  console.log("   Password: Password123!");
  console.log("   Role:     ACTOR (Verified & Active)");
  console.log("-------------------------------------------------------");
  console.log("🎬 CASTER ACCOUNT:");
  console.log("   Email:    caster@actorsglobe.com");
  console.log("   Password: Password123!");
  console.log("   Role:     CASTER (Verified & Active)");
  console.log("-------------------------------------------------------");
  console.log("🛡️ ADMIN ACCOUNT:");
  console.log("   Email:      admin@actorsglobe.com");
  console.log("   Password:   AdminPass123!");
  console.log("   Secret Key: AdminPass123!");
  console.log("=======================================================\n");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
