package com.scrollingstop.ui.settings

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.scrollingstop.data.db.BlockedAppDao
import com.scrollingstop.data.model.BlockedApp
import com.scrollingstop.data.preferences.SecurePreferences
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class SettingsViewModel @Inject constructor(
    private val blockedAppDao: BlockedAppDao,
    val prefs: SecurePreferences
) : ViewModel() {

    val blockedApps = blockedAppDao.getAll()

    fun addApp(packageName: String, displayName: String) {
        viewModelScope.launch {
            blockedAppDao.insert(BlockedApp(packageName = packageName, displayName = displayName))
        }
    }

    fun removeApp(packageName: String) {
        viewModelScope.launch {
            blockedAppDao.deleteByPackage(packageName)
        }
    }
}
