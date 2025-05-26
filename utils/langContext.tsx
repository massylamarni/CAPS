import React, { createContext, useContext, useState } from 'react';
import { lang_en } from "@/assets/languages/lang-en";
import { lang_fr } from "@/assets/languages/lang-fr";
import { lang_ar } from "@/assets/languages/lang-ar";
import { lang_ch } from "@/assets/languages/lang_ch";
import { lang_tif } from "@/assets/languages/lang_tif";

type LangContextType = {
  lang: any;
  updateLangTo: (langKey: 'en' | 'fr' | 'ar' | 'ch' | 'tif') => void;
};

const LangContext = createContext<LangContextType | undefined>(undefined);

export const useLangs = (): LangContextType => {
  const context = useContext(LangContext);
  if (!context) {
    throw new Error('useLangs must be used within a LangProvider');
  }
  return context;
};

export const LangProvider = ({ children }: { children: React.ReactNode }) => {
  const [lang, setLang] = useState(lang_fr);
  const updateLangTo = (langKey: 'en' | 'fr' | 'ar' | 'ch' | 'tif') => {
    const langs = {
      'en': lang_en,
      'fr': lang_fr,
      'ar': lang_ar,
      'ch': lang_ch,
      'tif': lang_tif
    }
    setLang(langs[langKey]);
  };

  return (
    <LangContext.Provider value={{ lang, updateLangTo }}>
      {children}
    </LangContext.Provider>
  );
};
