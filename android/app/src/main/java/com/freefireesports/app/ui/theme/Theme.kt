package com.freefireesports.app.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Typography
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

// ---------------- Theme 1: Premium Black + Gold ----------------
private val BlackGoldColorScheme = darkColorScheme(
    primary = Color(0xFFD4AF37),
    onPrimary = Color(0xFF1A1400),
    secondary = Color(0xFFB8860B),
    background = Color(0xFF0D0D0D),
    onBackground = Color(0xFFF5F5F5),
    surface = Color(0xFF1A1A1A),
    onSurface = Color(0xFFF0F0F0),
    error = Color(0xFFCF6679),
)

// ---------------- Theme 2: Premium Dark Esports ----------------
private val DarkEsportsColorScheme = darkColorScheme(
    primary = Color(0xFF4FC3F7),
    onPrimary = Color(0xFF00131A),
    secondary = Color(0xFF7C4DFF),
    background = Color(0xFF0A0E14),
    onBackground = Color(0xFFECECEC),
    surface = Color(0xFF151A23),
    onSurface = Color(0xFFE6E6E6),
    error = Color(0xFFFF6B6B),
)

enum class AppTheme(val key: String) {
    BLACK_GOLD("black_gold"),
    DARK_ESPORTS("dark_esports");

    companion object {
        // Matches Profile.themePreference from the backend — falls back to
        // Black+Gold for anything unrecognized instead of crashing.
        fun fromKey(key: String?): AppTheme = entries.find { it.key == key } ?: BLACK_GOLD
    }
}

@Composable
fun FreeFireEsportsTheme(
    appTheme: AppTheme = AppTheme.BLACK_GOLD,
    content: @Composable () -> Unit,
) {
    val colorScheme = when (appTheme) {
        AppTheme.BLACK_GOLD -> BlackGoldColorScheme
        AppTheme.DARK_ESPORTS -> DarkEsportsColorScheme
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography(),
        content = content,
    )
}
