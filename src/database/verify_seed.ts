import 'dotenv/config';
import dataSource from './datasource';

async function verify() {
  console.log('Initializing Data Source...');
  if (!dataSource.isInitialized) {
    await dataSource.initialize();
  }

  const tables = [
    'users',
    'properties',
    'wallets',
    'wallet_transactions',
    'bank_accounts',
    'payment_methods',
    'rentals',
    'tenant_profiles',
    'loan_applications',
    'rent_savings',
    'plan'
  ];

  console.log('Verifying record counts...');
  for (const table of tables) {
    const count = await dataSource.query(`SELECT COUNT(*) FROM "${table}"`);
    console.log(`${table}: ${count[0].count}`);
  }

  await dataSource.destroy();
}

verify();
