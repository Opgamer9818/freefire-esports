package com.freefireesports.app.notification

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.freefireesports.app.network.NotificationDto
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

class NotificationViewModel(
    private val repository: NotificationRepository = NotificationRepository(),
) : ViewModel() {

    private val _notifications = MutableStateFlow<List<NotificationDto>>(emptyList())
    val notifications: StateFlow<List<NotificationDto>> = _notifications.asStateFlow()

    val unreadCount: StateFlow<Int> = _notifications
        .map { list -> list.count { it.readAt == null } }
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), 0)

    fun load() {
        viewModelScope.launch {
            try {
                _notifications.value = repository.list()
            } catch (_: Exception) {
            }
        }
    }

    fun markRead(id: String) {
        viewModelScope.launch {
            try {
                repository.markRead(id)
                load()
            } catch (_: Exception) {
            }
        }
    }

    fun markAllRead() {
        viewModelScope.launch {
            try {
                repository.markAllRead()
                load()
            } catch (_: Exception) {
            }
        }
    }
}
