import { Session } from '@supabase/supabase-js';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { supabase } from './supabase';

type Ctx = {
  sesioni: Session | null;
  dukeNgarkuar: boolean;
  rikuperimFjalekalimi: boolean;
  setRikuperimFjalekalimi: (vlera: boolean) => void;
};
const SesioniCtx = createContext<Ctx>({
  sesioni: null,
  dukeNgarkuar: true,
  rikuperimFjalekalimi: false,
  setRikuperimFjalekalimi: () => {},
});

export function SesioniProvider({ children }: { children: ReactNode }) {
  const [sesioni, setSesioni] = useState<Session | null>(null);
  const [dukeNgarkuar, setDukeNgarkuar] = useState(true);
  const [rikuperimFjalekalimi, setRikuperimFjalekalimi] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSesioni(data.session);
      setDukeNgarkuar(false);
    });
    const { data } = supabase.auth.onAuthStateChange((event, s) => {
      setSesioni(s);
      if (event === 'PASSWORD_RECOVERY') setRikuperimFjalekalimi(true);
      if (event === 'USER_UPDATED' || event === 'SIGNED_OUT' || event === 'SIGNED_IN') {
        setRikuperimFjalekalimi(false);
      }
    });
    return () => data.subscription.unsubscribe();
  }, []);

  return (
    <SesioniCtx.Provider
      value={{ sesioni, dukeNgarkuar, rikuperimFjalekalimi, setRikuperimFjalekalimi }}>
      {children}
    </SesioniCtx.Provider>
  );
}

export const useSesioni = () => useContext(SesioniCtx);
