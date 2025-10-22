import { db } from '../utils/db/drizzle';
import { usersTable } from '../utils/db/schema';
import { hashPassword } from '../lib/auth';

/**
 * Script to create a new user in the database
 * Run with: npx tsx scripts/create-user.ts
 */

async function createUser() {
  try {
    const email = 'admin@example.com';
    const username = 'Admin User';
    const password = 'password123';
    const role = 'Administrator';

    // Hash the password
    const hashedPassword = await hashPassword(password);

    // Insert user into database
    const newUser = await db.insert(usersTable).values({
      username,
      email,
      password: hashedPassword,
      role,
    }).returning();

    console.log('User created successfully:', {
      id: newUser[0].id,
      username: newUser[0].username,
      email: newUser[0].email,
      role: newUser[0].role,
    });

    console.log('\nYou can now login with:');
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);

  } catch (error) {
    console.error('Error creating user:', error);
  }
}

// Run the script
createUser();
