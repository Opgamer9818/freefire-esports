package com.freefireesports.app.profile

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.freefireesports.app.network.ProfileDto
import com.freefireesports.app.network.UpdateProfileRequest
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

sealed class ProfileUiState {
    data object Loading : ProfileUiState()
    data class Loaded(val profile: ProfileDto) : ProfileUiState()
    data class Saving(val profile: ProfileDto) : ProfileUiState()
    data class Error(val message: String) : ProfileUiState()
}

class ProfileViewModel(private val repository: ProfileRepository = ProfileRepository()) : ViewModel() {

    private val _uiState = MutableStateFlow<ProfileUiState>(ProfileUiState.Loading)
    val uiState: StateFlow<ProfileUiState> = _uiState.asStateFlow()

    fun loadProfile() {
        viewModelScope.launch {
            _uiState.value = ProfileUiState.Loading
            try {
                _uiState.value = ProfileUiState.Loaded(repository.getProfile())
            } catch (e: Exception) {
                _uiState.value = ProfileUiState.Error(e.message ?: "Could not load profile")
            }
        }
    }

    fun saveProfile(request: UpdateProfileRequest) {
        val current = (_uiState.value as? ProfileUiState.Loaded)?.profile
        viewModelScope.launch {
            if (current != null) _uiState.value = ProfileUiState.Saving(current)
            try {
                _uiState.value = ProfileUiState.Loaded(repository.updateProfile(request))
            } catch (e: Exception) {
                _uiState.value = ProfileUiState.Error(e.message ?: "Could not save profile")
            }
        }
    }
}
