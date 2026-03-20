package com.scrollingstop.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.drawBehind
import androidx.compose.ui.geometry.CornerRadius
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.scrollingstop.ui.theme.AccentBlue
import com.scrollingstop.ui.theme.AccentViolet
import com.scrollingstop.ui.theme.Gray600
import com.scrollingstop.ui.theme.SurfaceCard

@Composable
fun GradientButton(text: String, onClick: () -> Unit, enabled: Boolean = true) {
    Button(
        onClick = onClick,
        enabled = enabled,
        modifier = Modifier
            .fillMaxWidth()
            .drawBehind {
                if (enabled) {
                    drawRoundRect(
                        brush = Brush.radialGradient(
                            colors = listOf(AccentViolet.copy(alpha = 0.3f), Color.Transparent),
                            center = center,
                            radius = size.width * 0.6f
                        ),
                        cornerRadius = CornerRadius(12.dp.toPx())
                    )
                }
            },
        colors = ButtonDefaults.buttonColors(
            containerColor = Color.Transparent,
            contentColor = Color.White,
            disabledContainerColor = SurfaceCard,
            disabledContentColor = Gray600
        ),
        shape = RoundedCornerShape(12.dp)
    ) {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .background(
                    if (enabled) Brush.horizontalGradient(
                        listOf(AccentViolet, AccentBlue)
                    ) else Brush.horizontalGradient(
                        listOf(SurfaceCard, SurfaceCard)
                    ),
                    RoundedCornerShape(12.dp)
                )
                .padding(vertical = 8.dp),
            contentAlignment = Alignment.Center
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text(text, fontWeight = FontWeight.SemiBold, fontSize = 16.sp, color = Color.White)
                Spacer(Modifier.width(8.dp))
                Icon(Icons.AutoMirrored.Filled.ArrowForward, contentDescription = null, modifier = Modifier.size(18.dp), tint = Color.White)
            }
        }
    }
}
