const { initializeApp, cert } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');

initializeApp({ projectId: 'studio-1410114603-9e1f6' });
const auth = getAuth();

async function main() {
    const listUsersResult = await auth.listUsers(1000);
    const user = listUsersResult.users.find(u => u.uid.endsWith('TGxW7YMNFIf2'));
    if (user) {
        console.log('Found user UID:', user.uid);
    } else {
        console.log('User not found by slug TGxW7YMNFIf2');
    }
}
main().catch(console.error);
