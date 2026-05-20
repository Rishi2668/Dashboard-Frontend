import { useEffect, useState } from 'react';
import { api, API_URL } from '@/api/client';

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

    const apply = (data: { api_features?: Partial<BackendFeatures> }) => {
      setFeatures({ ...DEFAULT, ...data.api_features });
      setChecked(true);
    };

    // Prefer dashboard stats (same API URL as the rest of the app)
    api
      .get('/dashboard/stats')
      .then((r) => apply(r.data as { api_features?: Partial<BackendFeatures> }))
      .catch(() =>
        fetch(`${origin}/health`)
          .then((r) => r.json())
          .then(apply)
          .catch(() => {
            setFeatures(DEFAULT);
            setChecked(true);
          })
      );
  }, []);

  return { features, checked };
}
