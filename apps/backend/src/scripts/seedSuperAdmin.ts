import 'dotenv/config';
import prisma from '../lib/prisma';

/**
 * Seeds the super admin into `whitelisted_emails`. Safe to re-run: it never
 * touches an existing password or activation, it only (re)asserts the role.
 * The super admin then activates via "First Time Activation" on the portal.
 */
async function main() {
    const email = (process.env.SUPER_ADMIN_EMAIL || 'tpo@ggits.org').trim().toLowerCase();

    const row = await prisma.whitelistedEmail.upsert({
        where: { email },
        update: { role: 'SUPER_ADMIN', isActive: true },
        create: { email, role: 'SUPER_ADMIN', addedBy: 'seed' },
    });

    console.log(`Super admin ready: ${row.email} (${row.activatedAt ? 'already activated' : 'awaiting first-time activation'})`);
}

main()
    .catch((error) => {
        console.error('Seed failed:', error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
        process.exit();
    });
