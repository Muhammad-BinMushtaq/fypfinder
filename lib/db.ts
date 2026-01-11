import { PrismaClient } from "@/app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";


const adapter = new PrismaPg({
  connectionString: process.env["DIRECT_URL"]!
})

const prismaClientSingleton = () => {
  return new PrismaClient({ adapter }

  )
}

declare const gloablThis: {
  prismaGlobal?: ReturnType<typeof prismaClientSingleton>
}
  & typeof global;

const prisma = gloablThis.prismaGlobal ?? prismaClientSingleton();
export default prisma;

if (process.env.NODE_ENV !== "production") {
  gloablThis.prismaGlobal = prisma;
}