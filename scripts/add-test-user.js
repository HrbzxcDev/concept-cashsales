/**
 * Simple script to add a test user to the database
 * Run with: node scripts/add-test-user.js
 */

const bcrypt = require('bcryptjs');

async function addTestUser() {
  try {
    // This would normally connect to your database
    // For now, we'll just show you the SQL to run manually
    
    const email = 'admin@example.com';
    const username = 'Admin User';
    const password = 'password123';
    const role = 'Administrator';
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12);
    
    console.log('Add this user to your tblusers table:');
    console.log('=====================================');
    console.log(`INSERT INTO tblusers (username, email, password, role) VALUES`);
    console.log(`('${username}', '${email}', '${hashedPassword}', '${role}');`);
    console.log('');
    console.log('Or use the admin panel at /admin/users to create users through the UI.');
    console.log('');
    console.log('Test credentials:');
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

addTestUser();
