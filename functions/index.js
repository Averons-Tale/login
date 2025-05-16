/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {onRequest} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });


const { onRequest } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
admin.initializeApp();

exports.verifyToken = onRequest(async (req, res) => {
  const authHeader = req.headers.authorization || "";
  const idToken = authHeader.split("Bearer ")[1];

  if (!idToken) return res.status(400).json({ valid: false });

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    res.json({ valid: true, uid: decodedToken.uid });
  } catch (err) {
    res.status(401).json({ valid: false });
  }
});



// Importiere die Firebase Functions und Admin SDK
const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Initialisiere Firebase Admin SDK
admin.initializeApp();

// Funktion zur Token-Verifizierung
exports.verifyToken = functions.https.onRequest(async (req, res) => {
  const authHeader = req.headers.authorization || "";
  const idToken = authHeader.split("Bearer ")[1];

  // Überprüfe, ob der Token vorhanden ist
  if (!idToken) return res.status(400).json({ valid: false });

  try {
    // Versuche, das Token zu decodieren und zu überprüfen
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    res.json({ valid: true, uid: decodedToken.uid });
  } catch (err) {
    // Falls der Token ungültig oder abgelaufen ist
    res.status(401).json({ valid: false });
  }
});






const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({origin: true});

// Firebase Admin initialisieren
admin.initializeApp();

exports.authProxy = functions.https.onRequest((req, res) => {
    cors(req, res, async () => {
        if (req.method !== 'POST') return res.status(405).send('Method not allowed');
        
        try {
            const { token } = req.body;
            const decoded = await admin.auth().verifyIdToken(token);
            res.status(200).json({ valid: true, uid: decoded.uid });
        } catch (error) {
            res.status(401).json({ valid: false });
        }
    });
});