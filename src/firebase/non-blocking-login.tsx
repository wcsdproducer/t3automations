
'use client';
import {
  Auth,
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  getAdditionalUserInfo,
} from 'firebase/auth';
import { Firestore, doc, getDoc } from 'firebase/firestore';
import { setDocumentNonBlocking } from './non-blocking-updates';

/** Initiate anonymous sign-in (non-blocking). */
export function initiateAnonymousSignIn(authInstance: Auth, onError?: (error: any) => void): void {
  signInAnonymously(authInstance).catch(onError);
}

/** Initiate email/password sign-up (non-blocking). */
export function initiateEmailSignUp(authInstance: Auth, email: string, password: string, onError?: (error: any) => void): void {
  createUserWithEmailAndPassword(authInstance, email, password).catch(onError);
}

/** Initiate email/password sign-in (non-blocking). */
export function initiateEmailSignIn(authInstance: Auth, email: string, password: string, onError?: (error: any) => void): void {
  signInWithEmailAndPassword(authInstance, email, password).catch(onError);
}

/** Initiate Google sign-in (non-blocking). Creates user profile on first sign-in. */
export function initiateGoogleSignIn(auth: Auth, firestore: Firestore, onError?: (error: any) => void): void {
  const provider = new GoogleAuthProvider();
  signInWithPopup(auth, provider)
    .then(async (result) => {
      const user = result.user;
      const additionalInfo = getAdditionalUserInfo(result);

      // If it's a new user, create their business profile in Firestore
      if (additionalInfo?.isNewUser) {
        const businessProfileRef = doc(firestore, 'businessProfiles', user.uid);
        const docSnap = await getDoc(businessProfileRef);

        if (!docSnap.exists()) {
          const businessProfileData = {
            id: user.uid,
            businessName: user.displayName || 'New Business', // Default value
            contactEmail: user.email,
            phoneNumber: user.phoneNumber || '', // Default value
            service: 'HVAC Maintenance & Repair',
            defaultLandingPage: 'template-3',
          };
          // This is a non-blocking call
          setDocumentNonBlocking(businessProfileRef, businessProfileData, {});
        }
      }
      // Auth state listener will handle UI changes/redirects
    })
    .catch(onError);
}
