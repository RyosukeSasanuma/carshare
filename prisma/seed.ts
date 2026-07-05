import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";
import ws from "ws";
import bcrypt from "bcryptjs";

neonConfig.webSocketConstructor = ws;

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  // 既存データをクリア（依存順）
  await prisma.payment.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.car.deleteMany();
  await prisma.user.deleteMany();

  const adminPass = await bcrypt.hash("admin1234", 10);
  const userPass = await bcrypt.hash("user1234", 10);

  await prisma.user.create({
    data: {
      email: "admin@example.com",
      passwordHash: adminPass,
      name: "管理者",
      role: "admin",
    },
  });

  await prisma.user.create({
    data: {
      email: "user@example.com",
      passwordHash: userPass,
      name: "山田太郎",
      phone: "090-1234-5678",
      role: "user",
    },
  });

  const cars = [
    {
      name: "アストンマーティン DB11",
      brand: "Aston Martin",
      model: "DB11 V12",
      year: 2023,
      pricePerDay: 88000,
      seats: 4,
      transmission: "AT",
      fuel: "ガソリン",
      location: "東京都港区",
      description:
        "5.2L V12ツインターボを搭載した英国製グランドツアラー。伸びやかなボディに宿る圧倒的な加速と気品。ボディカラーはピュアホワイト。特別な一日を、最上級のドライビングとともに。",
      imageUrl: "/cars/aston-db11.svg",
    },
    {
      name: "ランドローバー ディフェンダー 110",
      brand: "Land Rover",
      model: "Defender 110",
      year: 2023,
      pricePerDay: 42000,
      seats: 5,
      transmission: "AT",
      fuel: "ガソリン",
      location: "東京都港区",
      description:
        "3.0L 直6エンジンを積む本格SUV。悪路を意のままに走破するタフネスと、洗練されたラグジュアリーを両立。都会でもアウトドアでも映える一台です。",
      imageUrl: "/cars/defender-110.svg",
    },
  ];

  for (const car of cars) {
    await prisma.car.create({ data: car });
  }

  console.log(`シード完了: ユーザー2件、車両${cars.length}件を作成しました`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
