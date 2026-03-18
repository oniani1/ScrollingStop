package com.scrollingstop.ui.overlay

import androidx.compose.animation.core.Animatable
import androidx.compose.animation.core.LinearEasing
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.drawscope.rotate
import com.scrollingstop.ui.theme.AccentOrange
import com.scrollingstop.ui.theme.StatusGreen
import kotlin.math.cos
import kotlin.math.sin
import kotlin.random.Random

private data class Particle(
    val startX: Float,
    val startY: Float,
    val velocityX: Float,
    val velocityY: Float,
    val rotationSpeed: Float,
    val color: Color,
    val size: Float
)

@Composable
fun ConfettiEffect(modifier: Modifier = Modifier) {
    val progress = remember { Animatable(0f) }
    val colors = listOf(AccentOrange, AccentOrange, StatusGreen, Color.White, Color(0xFFFBBF24))

    val particles = remember {
        List(60) {
            val angle = Random.nextFloat() * Math.PI.toFloat() * 2
            val speed = 400f + Random.nextFloat() * 600f
            Particle(
                startX = 0.5f + (Random.nextFloat() - 0.5f) * 0.3f,
                startY = 0.4f,
                velocityX = cos(angle) * speed,
                velocityY = sin(angle) * speed - 500f,
                rotationSpeed = Random.nextFloat() * 720f - 360f,
                color = colors[Random.nextInt(colors.size)],
                size = 6f + Random.nextFloat() * 8f
            )
        }
    }

    LaunchedEffect(Unit) {
        progress.animateTo(
            targetValue = 1f,
            animationSpec = tween(durationMillis = 2000, easing = LinearEasing)
        )
    }

    Canvas(modifier = modifier.fillMaxSize()) {
        val t = progress.value
        val gravity = 800f

        particles.forEach { p ->
            val elapsed = t * 2f
            val x = size.width * p.startX + p.velocityX * elapsed
            val y = size.height * p.startY + p.velocityY * elapsed + 0.5f * gravity * elapsed * elapsed
            val rotation = p.rotationSpeed * elapsed
            val alpha = (1f - t).coerceIn(0f, 1f)

            if (y < size.height + 50f && y > -50f) {
                rotate(degrees = rotation, pivot = Offset(x, y)) {
                    drawRect(
                        color = p.color.copy(alpha = alpha),
                        topLeft = Offset(x - p.size / 2, y - p.size / 2),
                        size = Size(p.size, p.size * 0.6f)
                    )
                }
            }
        }
    }
}
