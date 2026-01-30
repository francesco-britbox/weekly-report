const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function cleanup() {
  try {
    console.log('🧹 Cleaning up test feedback data...');

    const deleted = await prisma.weeklyReportFeedback.deleteMany({
      where: {
        OR: [
          { userName: { contains: 'Test' } },
          { userName: { contains: 'E2E' } },
        ],
      },
    });

    console.log(`✅ Deleted ${deleted.count} test feedback entries`);
    console.log('🎉 Database is clean and ready for production!');

  } catch (error) {
    console.error('❌ Cleanup failed:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

cleanup();
