import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'studio-1410114603-9e1f6'
  });
}

async function setPassword() {
  try {
    const uid = '6Nw77zkDqFdKearSTGxW7YMNFIf2';
    await admin.auth().updateUser(uid, {
      password: 'password123'
    });
    console.log('Successfully updated password to password123 for john@t3kniq.com');
  } catch (error) {
    console.error('Error updating password:', error);
  }
}

setPassword();
