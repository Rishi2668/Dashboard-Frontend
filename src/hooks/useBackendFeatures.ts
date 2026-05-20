import { useEffect, useState } from 'react';
import { API_URL } from '@/api/client';

export type BackendFeatures = {
  study_session_delete: boolean;
  revision_management_v2: boolean;
};

const DEFAULT: BackendFeatures = {
  study_session_delete: false,
  revision_management_v2: false,
};

export function useBackendFeatures() {
  const [features, setFeatures] = useState<BackendFeatures>(DEFAULT);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const origin = API_URL.replace(/\/api\/v1\/?$/, '');
    fetch(`${origin}/health`)
      .then((r) => r.json())
      .then((data: { api_features?: Partial<BackendFeatures> }) => {
        setFeatures({ ...DEFAULT, ...data.api_features });
      })
      .catch(() => setFeatures(DEFAULT))
      .finally(() => setChecked(true));
  }, []);

  return { features, checked };
}
