import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';
import { getMessaging } from 'firebase-admin/messaging';

export const FIREBASE_MESSAGING = 'FIREBASE_MESSAGING';
const FIREBASE_APP_NAME = 'otlob';

export const FirebaseMessagingProvider: Provider = {
  provide: FIREBASE_MESSAGING,
  inject: [ConfigService],
  useFactory: (config: ConfigService) => {
    const projectId = config.get<string>('FIREBASE_PROJECT_ID');
    const clientEmail = config.get<string>('FIREBASE_CLIENT_EMAIL');
    const rawKey = config.get<string>('FIREBASE_PRIVATE_KEY');
    const privateKey = rawKey?.replace(/\\n/g, '\n');

    if (!projectId || !clientEmail || !privateKey) {
      throw new Error('Missing Firebase credentials in config');
    }

    const existing = admin.apps.find((app) => app?.name === FIREBASE_APP_NAME);
    const app =
      existing ??
      admin.initializeApp(
        {
          credential: admin.credential.cert({
            projectId,
            clientEmail,
            privateKey,
          }),
        },
        FIREBASE_APP_NAME,
      );

    return getMessaging(app);
  },
};
