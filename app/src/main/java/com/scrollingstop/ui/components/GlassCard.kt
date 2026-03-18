package com.scrollingstop.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.scrollingstop.ui.theme.GlassBg
import com.scrollingstop.ui.theme.GlassBorder

@Composable
fun GlassCard(
    modifier: Modifier = Modifier,
    content: @Composable () -> Unit
) {
    Box(
        modifier = modifier
            .fillMaxWidth()
            .background(GlassBg, RoundedCornerShape(16.dp))
            .border(1.dp, GlassBorder, RoundedCornerShape(16.dp))
            .padding(20.dp)
    ) {
        content()
    }
}
