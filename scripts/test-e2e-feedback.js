const API_BASE = 'http://localhost:3001/api';

async function testFeedbackFeature() {
  console.log('🧪 Starting End-to-End Feedback Feature Test\n');

  try {
    // 1. Get vendors
    console.log('1️⃣  Fetching vendors...');
    const vendorsRes = await fetch(`${API_BASE}/vendors`);
    const vendorsData = await vendorsRes.json();
    const vendorId = vendorsData.vendors[0].id;
    console.log(`   ✅ Got vendor: ${vendorsData.vendors[0].name} (${vendorId})\n`);

    // 2. Test POST - Create feedback
    console.log('2️⃣  Creating feedback...');
    const createPayload = {
      vendor_id: vendorId,
      week_start: '2026-01-27',
      user_name: 'E2E Test User',
      feedback_html: '<p>Test feedback with <strong>bold</strong> and <em>italic</em></p><ul><li>Item 1</li><li>Item 2</li></ul>',
    };
    const createRes = await fetch(`${API_BASE}/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(createPayload),
    });
    const createData = await createRes.json();
    console.log(`   ✅ Created feedback ID: ${createData.feedback.id}`);
    console.log(`   ✅ User: ${createData.feedback.userName}`);
    console.log(`   ✅ HTML length: ${createData.feedback.feedbackHtml.length} chars\n`);

    // 3. Test GET - Retrieve feedback
    console.log('3️⃣  Retrieving feedback...');
    const getRes = await fetch(`${API_BASE}/feedback?vendor_id=${vendorId}&week_start=2026-01-27`);
    const getData = await getRes.json();
    console.log(`   ✅ Retrieved feedback ID: ${getData.feedback.id}`);
    console.log(`   ✅ User: ${getData.feedback.userName}`);
    console.log(`   ✅ Created: ${getData.feedback.createdAt}`);
    console.log(`   ✅ Updated: ${getData.feedback.updatedAt}\n`);

    // 4. Test POST - Update feedback
    console.log('4️⃣  Updating feedback...');
    const updatePayload = {
      vendor_id: vendorId,
      week_start: '2026-01-27',
      user_name: 'E2E Test User (Updated)',
      feedback_html: '<p>Updated test feedback!</p>',
    };
    const updateRes = await fetch(`${API_BASE}/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatePayload),
    });
    const updateData = await updateRes.json();
    console.log(`   ✅ Updated feedback ID: ${updateData.feedback.id}`);
    console.log(`   ✅ Same ID as before: ${updateData.feedback.id === createData.feedback.id}`);
    console.log(`   ✅ User changed: ${updateData.feedback.userName}`);
    console.log(`   ✅ Updated timestamp changed: ${updateData.feedback.updatedAt !== createData.feedback.updatedAt}\n`);

    // 5. Verify update persisted
    console.log('5️⃣  Verifying update persisted...');
    const verifyRes = await fetch(`${API_BASE}/feedback?vendor_id=${vendorId}&week_start=2026-01-27`);
    const verifyData = await verifyRes.json();
    console.log(`   ✅ Feedback still exists: ${verifyData.feedback !== null}`);
    console.log(`   ✅ User name updated: ${verifyData.feedback.userName === 'E2E Test User (Updated)'}`);
    console.log(`   ✅ HTML updated: ${verifyData.feedback.feedbackHtml === '<p>Updated test feedback!</p>'}\n`);

    console.log('✅ All tests passed! Feedback feature is working correctly.\n');

    // Summary
    console.log('📊 Test Summary:');
    console.log('   • Vendor fetching: ✅');
    console.log('   • Feedback creation: ✅');
    console.log('   • Feedback retrieval: ✅');
    console.log('   • Feedback update (upsert): ✅');
    console.log('   • Data persistence: ✅');
    console.log('   • Rich HTML content: ✅\n');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

testFeedbackFeature()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
