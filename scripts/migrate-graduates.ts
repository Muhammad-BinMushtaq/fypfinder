import prisma from "../lib/db";

async function main() {
  console.log("Starting graduate migration...");

  // Get all students with their user emails
  const students = await prisma.student.findMany({
    include: {
      user: true,
    },
  });

  console.log(`Found ${students.length} total students.`);

  const updates = {
    graduated: [] as string[],
    sem5: [] as string[],
    sem6: [] as string[],
    sem7: [] as string[],
    sem8: [] as string[],
    skipped: [] as string[],
  };

  for (const student of students) {
    const email = student.user.email.toLowerCase();
    console.log("Checking email:", email);
    
    // Example emails: b23f0001se003@..., b22f1511se142@...
    // Regex to capture the year (22, 23) and season (f, s)
    const match = email.match(/^b?(\d{2})(f|s)/);

    if (!match) {
      updates.skipped.push(email);
      continue;
    }

    const year = parseInt(match[1], 10); // 22, 23
    const season = match[2]; // f, s

    let newSemester = student.currentSemester;
    let isGraduated = student.isGraduated;

    if (year <= 22) {
      isGraduated = true;
    } else if (year === 23) {
      if (season === "f" || season === "fa") {
        newSemester = 7;
        isGraduated = false;
      } else if (season === "s" || season === "sp") {
        newSemester = 8;
        isGraduated = false;
      }
    } else if (year === 24) {
      if (season === "f" || season === "fa") {
        newSemester = 5;
        isGraduated = false;
      } else if (season === "s" || season === "sp") {
        newSemester = 6;
        isGraduated = false;
      }
    } else {
      updates.skipped.push(email);
      continue;
    }

    // Determine if an update is needed
    if (student.currentSemester !== newSemester || student.isGraduated !== isGraduated) {
      // Perform the update
      await prisma.student.update({
        where: { id: student.id },
        data: {
          currentSemester: newSemester,
          isGraduated: isGraduated,
        },
      });

      if (isGraduated) {
        updates.graduated.push(email);
        
        // Cancel pending partner requests for graduated students
        await prisma.request.updateMany({
          where: {
            OR: [
              { fromStudentId: student.id },
              { toStudentId: student.id }
            ],
            type: "PARTNER",
            status: "PENDING"
          },
          data: {
            status: "REJECTED" // or CANCELLED, but schema has REJECTED
          }
        });
      } else if (newSemester === 5) {
        updates.sem5.push(email);
      } else if (newSemester === 6) {
        updates.sem6.push(email);
      } else if (newSemester === 7) {
        updates.sem7.push(email);
      } else if (newSemester === 8) {
        updates.sem8.push(email);
      }
    } else {
      updates.skipped.push(email);
    }
  }

  console.log("\nMigration Summary:");
  console.log(`🎓 Marked as Graduated: ${updates.graduated.length}`);
  console.log(`📚 Updated to Semester 5: ${updates.sem5.length}`);
  console.log(`📚 Updated to Semester 6: ${updates.sem6.length}`);
  console.log(`📚 Updated to Semester 7: ${updates.sem7.length}`);
  console.log(`📚 Updated to Semester 8: ${updates.sem8.length}`);
  console.log(`⏭️  Skipped/Unchanged: ${updates.skipped.length}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
