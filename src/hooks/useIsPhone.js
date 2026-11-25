import { useEffect, useState } from 'react';

export const PHONE_QUERY = '(max-width: 760px)';

// true en pantallas de celular; se actualiza si cambia el ancho.
export default function useIsPhone() {
  const [isPhone, setIsPhone] = useState(() => window.matchMedia(PHONE_QUERY).matches);
  useEffect(() => {
    const media = window.matchMedia(PHONE_QUERY);
    const onChange = () => setIsPhone(media.matches);
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);
  return isPhone;
}
