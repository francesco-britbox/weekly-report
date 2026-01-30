const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function runMigration() {
  try {
    console.log('🔄 Starting migration: Add weekly_report_feedback table...');

    // Check if table already exists
    const tableExists = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'weekly_report_feedback'
      );
    `;

    if (tableExists[0].exists) {
      console.log('✅ Table already exists. Skipping migration.');
      return;
    }

    // Read the SQL migration file
    const sqlPath = path.join(__dirname, 'add-feedback-table.sql');
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

    // Verify table was created
    const verify = await prisma.$queryRaw`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'weekly_report_feedback'
      ORDER BY ordinal_position;
    `;

    console.log('📊 Table structure:');
    verify.forEach(col => {
      console.log(`   - ${col.column_name}: ${col.data_type}`);
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
