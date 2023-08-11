export const showLoading = () => {
  window.events.emit('show-loading')
}
export const hideLoading = () => {
  window.events.emit('hide-loading')
}

export const showProfile = () => {
  window.events.emit('show-profile')
}

export const hideProfile = () => {
  window.events.emit('hide-profile')
}

export const showPassword = () => {
  window.events.emit('show-password')
}

export const hidePassword = () => {
  window.events.emit('hide-password')
}

export const updateLayout = () => {
  window.events.emit('update-layout')
}
