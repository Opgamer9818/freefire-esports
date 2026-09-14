package com.freefireesports.app

import android.app.Application

// Firebase auto-initializes itself from google-services.json via a
// ContentProvider, so there's nothing to do here yet. This class exists
// as the place later phases hook app-wide setup into (e.g. FCM topic
// subscriptions in Phase 10).
class FreeFireEsportsApp : Application()
