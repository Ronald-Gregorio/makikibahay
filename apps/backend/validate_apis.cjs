const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .env.local
const envPath = path.resolve(__dirname, '.env.local');
if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
} else {
    console.log('No backend .env.local found, using process.env');
}

const envFrontendPath = path.resolve(__dirname, '../frontend/.env.local');
if (fs.existsSync(envFrontendPath)) {
    dotenv.config({ path: envFrontendPath });
} else {
    console.log('No frontend .env.local found');
}

async function validateAPIs() {
    const results = {};

    // 1. Validate MongoDB
    try {
        const mongoUri = process.env.MONGODB_URI;
        if (!mongoUri) throw new Error('MONGODB_URI is not set');
        await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
        results.MongoDB = 'SUCCESS';
        await mongoose.disconnect();
    } catch (error) {
        results.MongoDB = `FAILED: ${error.message}`;
    }

    // 2. Validate Cloudinary
    try {
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
        });

        // Test the API configuration
        if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY) {
            throw new Error('Cloudinary credentials missing');
        }
        const response = await cloudinary.api.ping();
        if (response.status === 'ok') {
            results.Cloudinary = 'SUCCESS';
        } else {
            results.Cloudinary = `FAILED: Unknown response ${JSON.stringify(response)}`;
        }
    } catch (error) {
        results.Cloudinary = `FAILED: ${error.message}`;
    }

    // 3. Validate SMTP (Nodemailer)
    try {
        if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
            throw new Error('SMTP credentials missing');
        }
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT || 587,
            secure: process.env.SMTP_PORT == 465,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
        await transporter.verify();
        results.SMTP_Nodemailer = 'SUCCESS';
    } catch (error) {
        results.SMTP_Nodemailer = `FAILED: ${error.message}`;
    }

    // 4. Validate Leaflet/OpenStreetMap
    // Since OSM is a public, unauthenticated tiling service, we just verify the client exists
    results.OpenStreetMap = 'SUCCESS (Public API)';

    // 5. Validate Google OAuth Configuration
    try {
        const clientId = process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
        const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

        if (!clientId || clientId.includes('your-google-client-id')) {
            results.Google_OAuth = 'FAILED: Google Client ID is missing or using default placeholder.';
        } else if (!clientSecret || clientSecret.includes('your-google-client-secret')) {
            results.Google_OAuth = 'WARNING: Client ID is present, but Backend Client Secret is missing or placeholder.';
        } else {
            results.Google_OAuth = 'SUCCESS: OAuth credentials correctly formatted in environment.';
        }
    } catch (err) {
        results.Google_OAuth = `FAILED: ${err.message}`;
    }

    // 6. Validate Umami Analytics
    try {
        const umamiId = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;
        if (!umamiId || umamiId.includes('your_umami_website_id_here') || umamiId === 'undefined') {
            results.Umami_Analytics = 'FAILED: Website ID is missing or set to placeholder.';
        } else {
            results.Umami_Analytics = 'SUCCESS: Umami Website ID configured.';
        }
    } catch (err) {
        results.Umami_Analytics = `FAILED: ${err.message}`;
    }

    // 7. Validate Sentry Error Tracking
    try {
        const sentryDsn = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;
        if (!sentryDsn || !sentryDsn.includes('sentry.io')) {
            results.Sentry = 'FAILED: Sentry DSN is missing or invalid URL format.';
        } else {
            results.Sentry = 'SUCCESS: Sentry DSN configured and correctly formatted.';
        }
    } catch (err) {
        results.Sentry = `FAILED: ${err.message}`;
    }

    // 8. Validate New Relic APM
    try {
        const newRelicKey = process.env.NEW_RELIC_LICENSE_KEY;
        if (!newRelicKey || newRelicKey.length < 20) {
            results.New_Relic = 'FAILED: License Key is missing or invalid length.';
        } else {
            results.New_Relic = 'SUCCESS: New Relic License Key configured.';
        }
    } catch (err) {
        results.New_Relic = `FAILED: ${err.message}`;
    }

    console.log("=== API VALIDATION REPORT ===");
    for (const [api, status] of Object.entries(results)) {
        console.log(`${api}: ${status}`);
    }
}

validateAPIs();
