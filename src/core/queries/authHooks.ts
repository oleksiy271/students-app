import { Platform } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import Keychain from 'react-native-keychain';

import { AuthApi, LoginRequest, SwitchCareerRequest } from '@polito/api-client';
import messaging from '@react-native-firebase/messaging';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { isEnvProduction } from '../../utils/env';
import { pluckData } from '../../utils/queries';
import { useApiContext } from '../contexts/ApiContext';
import { usePreferencesContext } from '../contexts/PreferencesContext';
import { UnsupportedUserTypeError } from '../errors/UnsupportedUserTypeError';
import { asyncStoragePersister } from '../providers/ApiProvider';

const useAuthClient = (): AuthApi => {
  return new AuthApi();
};

export const useLogin = () => {
  const authClient = useAuthClient();
  const { refreshContext } = useApiContext();
  const { updatePreference } = usePreferencesContext();

  return useMutation({
    mutationFn: (dto: LoginRequest) => {
      const client = { name: 'Students app' };

      return Promise.all([
        DeviceInfo.getDeviceName(),
        DeviceInfo.getModel(),
        DeviceInfo.getManufacturer(),
        DeviceInfo.getBuildNumber(),
        DeviceInfo.getVersion(),
        isEnvProduction ? messaging().getToken() : undefined,
      ])
        .then(
          ([
            name,
            model,
            manufacturer,
            buildNumber,
            appVersion,
            fcmRegistrationToken,
          ]) => {
            dto.device = {
              name,
              platform: Platform.OS,
              version: `${Platform.Version}`,
              model,
              manufacturer,
            };
            dto.client = {
              ...client,
              buildNumber,
              appVersion,
            };
            dto.preferences = { ...dto.preferences, fcmRegistrationToken };
          },
        )
        .then(() => authClient.login({ loginRequest: dto }))
        .then(pluckData)
        .then(res => {
          if (res?.type !== 'student') {
            throw new UnsupportedUserTypeError(
              `User type ${res?.type} not supported by this app`,
            );
          }
          return res;
        });
    },
    onSuccess: async data => {
      const { token, clientId, username } = data;
      refreshContext({ username, token });
      updatePreference('username', username);
      await Keychain.setGenericPassword(clientId, token);
    },
  });
};

export const useLogout = () => {
  const authClient = useAuthClient();
  const queryClient = useQueryClient();
  const { refreshContext } = useApiContext();

  return useMutation({
    mutationFn: () => authClient.logout(),
    onSuccess: async () => {
      refreshContext();
      asyncStoragePersister.removeClient();
      queryClient.removeQueries();
      await Keychain.resetGenericPassword();
    },
  });
};

export const useSwitchCareer = () => {
  const authClient = useAuthClient();
  const { refreshContext } = useApiContext();
  const { updatePreference } = usePreferencesContext();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto?: SwitchCareerRequest) =>
      authClient.switchCareer({ switchCareerRequest: dto }).then(pluckData),
    onSuccess: async data => {
      const { token, username } = data;
      refreshContext({
        token,
        username,
      });
      updatePreference('username', username);
      asyncStoragePersister.removeClient();
      queryClient.invalidateQueries([]);
      await Keychain.setGenericPassword(data.clientId, data.token);
    },
  });
};
