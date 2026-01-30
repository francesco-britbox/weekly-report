const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testFeedback() {
  try {
    console.log('🔍 Testing feedback model...');

    // Test create
    const feedback = await prisma.weeklyReportFeedback.create({
      data: {
        vendorId: 'cmke67l8a0000swr19gl9wlfq',
        weekStart: new Date('2026-01-27'),
        userName: 'Test User',
        feedbackHtml: '<p>Test feedback</p>',
      },
    });

    console.log('✅ Created feedback:', feedback);

    // Test read
    const found = await prisma.weeklyReportFeedback.findFirst({
      where: {
        vendorId: 'cmke67l8a0000swr19gl9wlfq',
        weekStart: new Date('2026-01-27'),
      },
    });

    console.log('✅ Found feedback:', found);

    // Test update
    const updated = await prisma.weeklyReportFeedback.update({
      where: { id: feedback.id },
      data: {
        feedbackHtml: '<p>Updated feedback</p>',
      },
    });

    console.log('✅ Updated feedback:', updated);

    // Clean up
    await prisma.weeklyReportFeedback.delete({
      where: { id: feedback.id },
    });

    console.log('✅ Deleted test feedback');
    console.log('🎉 All tests passed!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

testFeedback()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
