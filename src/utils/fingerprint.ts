import FingerprintJS from '@fingerprintjs/fingerprintjs';

export const getDeviceId = async (): Promise<string> => {
  try {
      const fp = await FingerprintJS.load();
      const result = await fp.get();
      return result.visitorId;
  } catch (error) {
      console.error('Lỗi khi lấy Device ID:', error);
      return 'unknown-device';
  }
};
