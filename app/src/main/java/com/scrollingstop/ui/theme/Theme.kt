package com.scrollingstop.ui.theme

import android.os.Build
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.dynamicDarkColorScheme
import androidx.compose.material3.dynamicLightColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.platform.LocalContext

private val DarkColorScheme = darkColorScheme(
    primary = AccentOrange,
    onPrimary = White,
    primaryContainer = AccentOrangeDim,
    onPrimaryContainer = White,
    secondary = AccentOrangeLight,
    onSecondary = DeepBlack,
    secondaryContainer = SurfaceCard,
    onSecondaryContainer = Gray200,
    background = DeepBlack,
    onBackground = Gray100,
    surface = SurfaceDark,
    onSurface = Gray100,
    surfaceVariant = SurfaceCard,
    onSurfaceVariant = Gray300,
    outline = GlassBorderLight,
)

private val LightColorScheme = lightColorScheme(
    primary = Gray800,
    onPrimary = White,
    primaryContainer = Gray200,
    onPrimaryContainer = Gray900,
    secondary = Gray600,
    onSecondary = White,
    secondaryContainer = Gray100,
    onSecondaryContainer = Gray900,
    background = Gray50,
    onBackground = Gray900,
    surface = White,
    onSurface = Gray900,
    surfaceVariant = Gray100,
    onSurfaceVariant = Gray700,
    outline = Gray400,
)

@Composable
fun ScrollingStopTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    dynamicColor: Boolean = false,
    content: @Composable () -> Unit
) {
    val colorScheme = when {
        dynamicColor && Build.VERSION.SDK_INT >= Build.VERSION_CODES.S -> {
            val context = LocalContext.current
            if (darkTheme) dynamicDarkColorScheme(context)
            else dynamicLightColorScheme(context)
        }
        darkTheme -> DarkColorScheme
        else -> LightColorScheme
    }

    MaterialTheme(
        colorScheme = colorScheme,
        content = content
    )
}
