import { Platform } from 'react-native';
import DeviceInfo from 'react-native-device-info';

import { AuthApi, LoginRequest, SwitchCareerRequest } from '@polito/api-client';
import { useMutation } from '@tanstack/react-query';

import { useApiContext } from '../contexts/ApiContext';

const useAuthClient = (): AuthApi => {
  const {
    clients: { auth: authClient },
  } = useApiContext();
  return authClient;
};

export const useLogin = () => {
  const authClient = useAuthClient();

  return useMutation((dto: LoginRequest) => {
    dto.client = {
      name: 'Students app',
    };
    dto.device = {
      name: 'S10+ di Luca',
      platform: 'Android',
      version: '12',
      model: 'S10',
      manufacturer: 'Samsung',
    };

    return Promise.all([
      DeviceInfo.getDeviceName(),
      DeviceInfo.getModel(),
      DeviceInfo.getManufacturer(),
    ])
      .then(([name, model, manufacturer]) => {
        dto.device = {
          name,
          platform: Platform.OS,
          version: `${Platform.Version}`,
          model,
          manufacturer,
        };
      })
      .then(() => {
        return authClient.login({ loginRequest: dto });
      });
  });
};

export const useLogout = () => {
  const authClient = useAuthClient();

  return useMutation(() => authClient.logout());
};

export const useSwitchCareer = () => {
  const authClient = useAuthClient();

  return useMutation((dto: SwitchCareerRequest) =>
    authClient.switchCareer({ switchCareerRequest: dto }),
  );
};
