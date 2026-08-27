---
name: firebase-app-platform
description: Build and operate apps on Firebase using Auth, Firestore, Cloud
  Functions, and Hosting. Use when building mobile/web backends with managed
  services, real-time data sync, or serverless APIs.
license: MIT
metadata:
  author: devops-skills
  version: "1.0"
tags:
  - cloud_providers
  - firebase-app-platform
depends_on: []
---

# [Firebase](../../../Software_Engineering_and_Other/Databases/firebase/SKILL.md) App Platform

Ship mobile and web backends with [Firebase](../../../Software_Engineering_and_Other/Databases/firebase/SKILL.md) managed services.

## When to Use This Skill

Use this skill when:
- Building mobile or web apps with real-time data sync
- Need authentication with minimal backend code
- Prototyping quickly with managed infrastructure
- Building [serverless](../../Containers_and_Orchestration/serverless/SKILL.md) APIs with Cloud Functions
- Hosting static sites or SPAs with CDN

## Prerequisites

- Node.js 18+
- [Firebase](../../../Software_Engineering_and_Other/Databases/firebase/SKILL.md) CLI (`npm install -g [firebase](../../../Software_Engineering_and_Other/Databases/firebase/SKILL.md)-tools`)
- Google Cloud account ([Firebase](../../../Software_Engineering_and_Other/Databases/firebase/SKILL.md) is part of GCP)
- A [Firebase](../../../Software_Engineering_and_Other/Databases/firebase/SKILL.md) project (create at console.[firebase](../../../Software_Engineering_and_Other/Databases/firebase/SKILL.md).google.com)

## Quick Start

```bash
# Install and authenticate
npm install -g [firebase](../../../Software_Engineering_and_Other/Databases/firebase/SKILL.md)-tools
[firebase](../../../Software_Engineering_and_Other/Databases/firebase/SKILL.md) login

# Initialize in your project directory
[firebase](../../../Software_Engineering_and_Other/Databases/firebase/SKILL.md) init
# Select: Firestore, Functions, Hosting, Emulators

# Start local emulators
[firebase](../../../Software_Engineering_and_Other/Databases/firebase/SKILL.md) emulators:start

# Deploy everything
[firebase](../../../Software_Engineering_and_Other/Databases/firebase/SKILL.md) deploy

# Deploy specific services
[firebase](../../../Software_Engineering_and_Other/Databases/firebase/SKILL.md) deploy --only functions
[firebase](../../../Software_Engineering_and_Other/Databases/firebase/SKILL.md) deploy --only hosting
[firebase](../../../Software_Engineering_and_Other/Databases/firebase/SKILL.md) deploy --only firestore:rules
```

## Firestore Database

### Security Rules

```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Messages: authenticated users can read, only owner can write
    match /channels/{channelId}/messages/{messageId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null
        && request.resource.data.userId == request.auth.uid
        && request.resource.data.body is string
        && request.resource.data.body.size() <= 5000;
      allow update, delete: if request.auth != null
        && resource.data.userId == request.auth.uid;
    }

    // Admin-only collection
    match /admin/{document=**} {
      allow read, write: if request.auth != null
        && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    // Default: deny everything
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

### Data Operations

```[typescript](../../../Software_Engineering_and_Other/Frontend/typescript/SKILL.md)
// lib/firestore.ts
import { getFirestore, collection, doc, setDoc, getDoc,
         query, where, orderBy, limit, onSnapshot,
         serverTimestamp, increment } from "[firebase](../../../Software_Engineering_and_Other/Databases/firebase/SKILL.md)/firestore";

const db = getFirestore();

// Create document with auto-ID
async function createMessage(channelId: string, body: string, userId: string) {
  const ref = doc(collection(db, "channels", channelId, "messages"));
  await setDoc(ref, {
    body,
    userId,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

// Real-time listener
function subscribeToMessages(channelId: string, callback: (msgs: any[]) => void) {
  const q = query(
    collection(db, "channels", channelId, "messages"),
    orderBy("createdAt", "desc"),
    limit(50)
  );
  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(messages);
  });
}

// Atomic counter
async function incrementViews(postId: string) {
  await setDoc(doc(db, "posts", postId), {
    views: increment(1),
  }, { merge: true });
}
```

### Indexes

```json
// firestore.indexes.json
{
  "indexes": [
    {
      "collectionGroup": "messages",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "channelId", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    }
  ]
}
```

## Authentication

```[typescript](../../../Software_Engineering_and_Other/Frontend/typescript/SKILL.md)
// lib/auth.ts
import { getAuth, signInWithPopup, GoogleAuthProvider,
         createUserWithEmailAndPassword, signInWithEmailAndPassword,
         signOut, onAuthStateChanged } from "[firebase](../../../Software_Engineering_and_Other/Databases/firebase/SKILL.md)/auth";

const auth = getAuth();

// Google sign-in
async function signInWithGoogle() {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  return result.user;
}

// Email/password registration
async function register(email: string, password: string) {
  const result = await createUserWithEmailAndPassword(auth, email, password);
  return result.user;
}

// Auth state listener
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("Signed in:", user.uid, user.email);
  } else {
    console.log("Signed out");
  }
});
```

## Cloud Functions

```[typescript](../../../Software_Engineering_and_Other/Frontend/typescript/SKILL.md)
// functions/src/index.ts
import { onRequest } from "[firebase](../../../Software_Engineering_and_Other/Databases/firebase/SKILL.md)-functions/v2/https";
import { onDocumentCreated } from "[firebase](../../../Software_Engineering_and_Other/Databases/firebase/SKILL.md)-functions/v2/firestore";
import { getFirestore } from "[firebase](../../../Software_Engineering_and_Other/Databases/firebase/SKILL.md)-admin/firestore";
import { initializeApp } from "[firebase](../../../Software_Engineering_and_Other/Databases/firebase/SKILL.md)-admin/app";

initializeApp();
const db = getFirestore();

// HTTP function (API endpoint)
export const api = onRequest({ cors: true, region: "us-central1" }, async (req, res) => {
  if (req.method !== "GET") {
    res.status(405).send("Method not allowed");
    return;
  }
  const snapshot = await db.collection("posts").orderBy("createdAt", "desc").limit(10).get();
  const posts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  res.json({ posts });
});

// Firestore trigger — runs when a new message is created
export const onMessageCreated = onDocumentCreated(
  "channels/{channelId}/messages/{messageId}",
  async (event) => {
    const data = event.data?.data();
    if (!data) return;

    // Update channel's last message timestamp
    await db.doc(`channels/${event.params.channelId}`).update({
      lastMessageAt: data.createdAt,
      messageCount: FieldValue.increment(1),
    });

    // Send notification (example)
    console.log(`New message in ${event.params.channelId}: ${data.body.substring(0, 50)}`);
  }
);
```

## Hosting

```json
// [firebase](../../../Software_Engineering_and_Other/Databases/firebase/SKILL.md).json
{
  "hosting": {
    "public": "dist",
    "ignore": ["[firebase](../../../Software_Engineering_and_Other/Databases/firebase/SKILL.md).json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      { "source": "/api/**", "function": "api" },
      { "source": "**", "destination": "/index.html" }
    ],
    "headers": [
      {
        "source": "**/*.@(js|css|svg|png|jpg|webp|woff2)",
        "headers": [{ "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }]
      },
      {
        "source": "**",
        "headers": [
          { "key": "X-Frame-Options", "value": "DENY" },
          { "key": "X-Content-Type-Options", "value": "nosniff" },
          { "key": "Strict-Transport-Security", "value": "max-age=63072000" }
        ]
      }
    ]
  }
}
```

## Local Emulators

```bash
# Start all emulators
[firebase](../../../Software_Engineering_and_Other/Databases/firebase/SKILL.md) emulators:start

# Start specific emulators
[firebase](../../../Software_Engineering_and_Other/Databases/firebase/SKILL.md) emulators:start --only auth,firestore,functions

# Export emulator data for persistence
[firebase](../../../Software_Engineering_and_Other/Databases/firebase/SKILL.md) emulators:export ./emulator-data
[firebase](../../../Software_Engineering_and_Other/Databases/firebase/SKILL.md) emulators:start --import=./emulator-data

# Emulator UI at http://localhost:4000
```

```json
// [firebase](../../../Software_Engineering_and_Other/Databases/firebase/SKILL.md).json — emulator config
{
  "emulators": {
    "auth": { "port": 9099 },
    "firestore": { "port": 8080 },
    "functions": { "port": 5001 },
    "hosting": { "port": 5000 },
    "ui": { "enabled": true, "port": 4000 }
  }
}
```

## Environment Configuration

```bash
# Set environment variables for functions
[firebase](../../../Software_Engineering_and_Other/Databases/firebase/SKILL.md) functions:config:set stripe.key="sk_live_xxx" app.name="MyApp"

# View config
[firebase](../../../Software_Engineering_and_Other/Databases/firebase/SKILL.md) functions:config:get

# Use in functions (v1)
const stripeKey = functions.config().stripe.key;

# For v2 functions, use .env files
# functions/.env
STRIPE_KEY=sk_live_xxx

# functions/.env.local (for emulators)
STRIPE_KEY=sk_test_xxx
```

## Multi-Environment Setup

```bash
# Create separate projects for each environment
[firebase](../../../Software_Engineering_and_Other/Databases/firebase/SKILL.md) use --add   # Add staging project alias
[firebase](../../../Software_Engineering_and_Other/Databases/firebase/SKILL.md) use staging # Switch to staging
[firebase](../../../Software_Engineering_and_Other/Databases/firebase/SKILL.md) use production

# Deploy to specific project
[firebase](../../../Software_Engineering_and_Other/Databases/firebase/SKILL.md) deploy --project my-app-staging
[firebase](../../../Software_Engineering_and_Other/Databases/firebase/SKILL.md) deploy --project my-app-production

# .firebaserc
{
  "projects": {
    "staging": "my-app-staging",
    "production": "my-app-production"
  }
}
```

## CLI Reference

```bash
[firebase](../../../Software_Engineering_and_Other/Databases/firebase/SKILL.md) projects:list              # List all projects
[firebase](../../../Software_Engineering_and_Other/Databases/firebase/SKILL.md) deploy                      # Deploy everything
[firebase](../../../Software_Engineering_and_Other/Databases/firebase/SKILL.md) deploy --only functions     # Deploy only functions
[firebase](../../../Software_Engineering_and_Other/Databases/firebase/SKILL.md) deploy --only hosting       # Deploy only hosting
[firebase](../../../Software_Engineering_and_Other/Databases/firebase/SKILL.md) deploy --only firestore     # Deploy rules + indexes
[firebase](../../../Software_Engineering_and_Other/Databases/firebase/SKILL.md) functions:log               # View function logs
[firebase](../../../Software_Engineering_and_Other/Databases/firebase/SKILL.md) hosting:channel:create pr-123  # Preview channel
[firebase](../../../Software_Engineering_and_Other/Databases/firebase/SKILL.md) hosting:channel:delete pr-123
```

## Security Best Practices

- Write strict Firestore security rules before any other code
- Separate environments by [Firebase](../../../Software_Engineering_and_Other/Databases/firebase/SKILL.md) project (staging/production)
- Enable budget alerts and quota [monitoring](../../Observability_and_SecOps/monitoring/SKILL.md) in GCP console
- Move privileged logic into Cloud Functions (never trust the client)
- Use App Check to prevent API abuse from non-app clients
- Enable Firestore [audit](../../../AI_and_Agents/Operations/audit/SKILL.md) logging for compliance
- Review OAuth consent screen settings

## Troubleshooting

| Issue | Solution |
|-------|---------|
| Permission denied | Check Firestore rules, verify auth state |
| Function cold starts | Use min instances (`minInstances: 1`), optimize imports |
| Emulator won't start | Check port conflicts, run `[firebase](../../../Software_Engineering_and_Other/Databases/firebase/SKILL.md) emulators:start --debug` |
| Deploy fails | Run `[firebase](../../../Software_Engineering_and_Other/Databases/firebase/SKILL.md) deploy --debug`, check service account permissions |
| Rules test failing | Use `[firebase](../../../Software_Engineering_and_Other/Databases/firebase/SKILL.md) emulators:exec` to run rules unit tests |

## Related Skills

- [gcp-cloud-functions](../../cloud-gcp/[gcp-cloud-functions](../gcp-cloud-functions/SKILL.md)/) — Function runtime patterns
- [vercel-deployments](../[vercel-deployments](../vercel-deployments/SKILL.md)/) — Alternative frontend hosting
- [convex-backend](../[convex-backend](../../../Software_Engineering_and_Other/Backend/convex-backend/SKILL.md)/) — Alternative managed backend
