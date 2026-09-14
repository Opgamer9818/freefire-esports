package com.freefireesports.app.ui.theme

import org.junit.Assert.assertEquals
import org.junit.Test

class AppThemeTest {

    @Test
    fun `fromKey returns the matching theme for a known key`() {
        assertEquals(AppTheme.DARK_ESPORTS, AppTheme.fromKey("dark_esports"))
        assertEquals(AppTheme.BLACK_GOLD, AppTheme.fromKey("black_gold"))
    }

    @Test
    fun `fromKey falls back to Black+Gold for null or unrecognized keys`() {
        assertEquals(AppTheme.BLACK_GOLD, AppTheme.fromKey(null))
        assertEquals(AppTheme.BLACK_GOLD, AppTheme.fromKey("not_a_real_theme"))
        assertEquals(AppTheme.BLACK_GOLD, AppTheme.fromKey(""))
    }
}
