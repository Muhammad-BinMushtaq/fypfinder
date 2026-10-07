import prisma from "../lib/db";
async function main() {
  const s = await prisma.student.findMany({ include: { user: true } });
  console.log(
    s
      .filter((x) => x.user.email.includes("b22"))
      .map((x) => ({ email: x.user.email, isGraduated: x.isGraduated, sem: x.currentSemester }))
  );
  process.exit(0);
}
main();
