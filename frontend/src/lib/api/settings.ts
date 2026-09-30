import api from './axios'

import type {
  SettingsResponse,
  UpdateSettingsRequest,
} from '../../types/setting'

export const getSettings =
  async (): Promise<SettingsResponse> => {
    const response =
      await api.get<SettingsResponse>(
        '/settings',
      )

    return response.data
  }

export const updateSettings = async (
  data: UpdateSettingsRequest,
): Promise<SettingsResponse> => {
  const response =
    await api.put<SettingsResponse>(
      '/settings',
      data,
    )

  return response.data
}