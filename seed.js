const { execSync } = require('child_process');

try {
  console.log('🌱 Running database seeds...');
  execSync('npm run seed', { stdio: 'inherit' });
} catch (error) {
  console.error('❌ Seeding failed:', error.message);
  process.exit(1);
}