import { createDatabase } from './db.js';
import { getServerConfig } from './config.js';

const email = String(process.argv[2] ?? '')
  .trim()
  .toLowerCase();

if (!email) {
  console.error('Usage: node server/promote-admin.js <email>');
  process.exit(1);
}

const config = getServerConfig();
const db = createDatabase(config.dbFile);

try {
  const existingUser = db.findUserByEmail(email);

  if (!existingUser) {
    console.error(`No user found for ${email}`);
    process.exit(1);
  }

  const promotedUser = db.setUserRoleByEmail(email, 'admin');
  console.log(`Promoted ${promotedUser.email} to admin.`);
} finally {
  db.close();
}
