const { Client } = require('pg');
const bcrypt = require('bcrypt');

async function seed() {
  const client = new Client({
    host: process.env.DB_HOST || 'ep-wandering-snowflake-a56upbb9-pooler.us-east-2.aws.neon.tech',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'payrentNeon',
    user: process.env.DB_USERNAME || 'idowuseyi22',
    password: process.env.DB_PASSWORD || 'DMLSpq7x1unB',
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('🌱 Starting database seeding...');

    // Seed users
    const users = [
      {
        email: 'admin@payrent.com',
        name: 'Admin User',
        password: await bcrypt.hash('password123', 10),
        userType: 'admin',
        isAdmin: true,
        isEmailVerified: true,
        isActive: true,
        phoneNumber: '+2348012345678',
        city: 'Lagos',
        state: 'Lagos',
        country: 'Nigeria',
      },
      {
        email: 'landlord@payrent.com',
        name: 'John Landlord',
        password: await bcrypt.hash('password123', 10),
        userType: 'landlord',
        isEmailVerified: true,
        isActive: true,
        phoneNumber: '+2348012345679',
        city: 'Abuja',
        state: 'FCT',
        country: 'Nigeria',
      },
      {
        email: 'tenant@payrent.com',
        name: 'Jane Tenant',
        password: await bcrypt.hash('password123', 10),
        userType: 'tenant',
        isEmailVerified: true,
        isActive: true,
        phoneNumber: '+2348012345680',
        city: 'Port Harcourt',
        state: 'Rivers',
        country: 'Nigeria',
      },
    ];

    for (const user of users) {
      const existingUser = await client.query('SELECT id FROM users WHERE email = $1', [user.email]);
      if (existingUser.rows.length === 0) {
        const result = await client.query(`
          INSERT INTO users (email, name, password, "userType", "isAdmin", "isEmailVerified", "isActive", "phoneNumber", city, state, country, "createdAt")
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
          RETURNING id
        `, [user.email, user.name, user.password, user.userType, user.isAdmin || false, user.isEmailVerified, user.isActive, user.phoneNumber, user.city, user.state, user.country]);
        
        const userId = result.rows[0].id;
        
        // Create wallet for user
        await client.query(`
          INSERT INTO wallets ("userId", "balanceKobo", "isActive", "createdAt")
          VALUES ($1, $2, $3, NOW())
        `, [userId, user.userType === 'landlord' ? '500000000' : '10000000', true]);
        
        console.log(`✅ Created user and wallet: ${user.email}`);
      }
    }

    console.log('✅ Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error during seeding:', error);
  } finally {
    await client.end();
  }
}

seed();