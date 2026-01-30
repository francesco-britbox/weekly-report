const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function runMigration() {
  try {
    console.log('🔄 Starting migration: Add user_id to feedback table...');

    // Check if user_id column already exists
    const columnCheck = await prisma.$queryRaw`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'weekly_report_feedback'
      AND column_name = 'user_id';
    `;

    if (columnCheck.length > 0) {
      console.log('✅ user_id column already exists. Skipping migration.');
      return;
    }

    // Count existing feedback
    const existingCount = await prisma.weeklyReportFeedback.count();
    console.log(`📊 Found ${existingCount} existing feedback entries`);

    // Read the SQL migration file
    const sqlPath = path.join(__dirname, 'add-user-id-to-feedback.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    // Remove comments and split by semicolons
    const cleanedSql = sql
      .split('\n')
      .filter(line => !line.trim().startsWith('--'))
      .join('\n');

    const statements = cleanedSql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    console.log(`📝 Executing ${statements.length} SQL statements...`);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement) {
        console.log(`  [${i + 1}/${statements.length}] Executing statement...`);
        await prisma.$executeRawUnsafe(statement);
        console.log(`  ✅ Statement ${i + 1} completed`);
      }
    }

    console.log('✅ Migration completed successfully!');

    // Verify the changes
    const verify = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'weekly_report_feedback'
      ORDER BY ordinal_position;
    `;

    console.log('📊 Updated table structure:');
    verify.forEach(col => {
      console.log(`   - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });

    // Check unique constraint
    const constraints = await prisma.$queryRaw`
      SELECT constraint_name
      FROM information_schema.table_constraints
      WHERE table_name = 'weekly_report_feedback'
      AND constraint_type = 'UNIQUE';
    `;

    console.log('🔒 Unique constraints:');
    constraints.forEach(c => {
      console.log(`   - ${c.constraint_name}`);
    });

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

runMigration()
  .then(() => {
    console.log('🎉 Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });
