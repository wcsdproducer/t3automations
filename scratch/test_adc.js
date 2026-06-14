const admin = require('firebase-admin');
admin.initializeApp({
  projectId: 'studio-1410114603-9e1f6'
});
const db = admin.firestore();
db.collectionGroup('customDomains').get().then(snap => {
  console.log("Size:", snap.size);
  snap.forEach(doc => console.log(doc.id, doc.data()));
}).catch(console.error);
