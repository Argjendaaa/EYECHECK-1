import { Session } from '@supabase/supabase-js';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { supabase } from './supabase';

type Ctx = { sesioni: Session | null; dukeNgarkuar: boolean };
const SesioniCtx = createContext<Ctx>({ sesioni: null, dukeNgarkuar: true });

export function SesioniProvider({ children }: { children: ReactNode }) {
  const [sesioni, setSesioni] = useState<Session | null>(null);
  const [dukeNgarkuar, setDukeNgarkuar] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSesioni(data.session);
      setDukeNgarkuar(false);
    });
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSesioni(s));
    return () => data.subscription.unsubscribe();
  }, []);

  return (
    <SesioniCtx.Provider value={{ sesioni, dukeNgarkuar }}>
      {children}
    </SesioniCtx.Provider>
  );
}

export const useSesioni = () => useContext(SesioniCtx);
