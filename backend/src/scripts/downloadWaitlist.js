const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const fs = require('fs');
const path = require('path');

// Initialize Firebase Admin with service account
initializeApp({
  credential: cert(require('./serviceAccountKey.json'))
});

const db = getFirestore();

async function downloadWaitlist() {
  try {
    console.log('Fetching waitlist data...');
    
    // Get all documents from the waitlist collection
    const snapshot = await db.collection('waitlist').get();
    
    console.log('Processing data...');
    
    // Convert the data to an array of objects
    const waitlistData = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      // Convert Firestore Timestamp to ISO string for better readability
      createdAt: doc.data().createdAt?.toDate().toISOString() || null
    }));

    // Create output directory if it doesn't exist
    const outputDir = path.join(__dirname, '../../exports');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Save as JSON
    const jsonPath = path.join(outputDir, 'waitlist.json');
    fs.writeFileSync(jsonPath, JSON.stringify(waitlistData, null, 2));
    console.log(`JSON data saved to ${jsonPath}`);

    // Save as CSV
    const csvPath = path.join(outputDir, 'waitlist.csv');
    const csvContent = convertToCSV(waitlistData);
    fs.writeFileSync(csvPath, csvContent);
    console.log(`CSV data saved to ${csvPath}`);

    console.log(`Total entries: ${waitlistData.length}`);
    
    return waitlistData;
  } catch (error) {
    console.error('Error downloading waitlist:', error);
    throw error;
  }
}

function convertToCSV(data) {
  if (data.length === 0) return '';

  // Get headers from the first object
  const headers = Object.keys(data[0]);
  
  // Create CSV rows
  const csvRows = [
    // Headers row
    headers.join(','),
    // Data rows
    ...data.map(row => 
      headers.map(header => {
        // Handle special characters and commas in the content
        const cell = row[header]?.toString() || '';
        return cell.includes(',') ? `"${cell}"` : cell;
      }).join(',')
    )
  ];

  return csvRows.join('\n');
}

// Run the script if called directly
if (require.main === module) {
  downloadWaitlist()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Script failed:', error);
      process.exit(1);
    });
}

module.exports = { downloadWaitlist }; 