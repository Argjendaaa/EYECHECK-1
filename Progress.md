# PROGRES

## Ndryshimi i fokusit
- Projekti kaloi nga kontrolli fillestar i shikimit te aplikacioni i optikës për klientë dhe staf.
- Harta e produktit u përditësua; rrjedhat ende duhen validuar me një optikë.
- Ekrani kryesor tani ka pamje demonstrimi për klientin dhe stafin; të dhënat janë statike.

## Çka punon
- M0: AGENTS.md është në repo.
- M1: aplikacioni lidhet me Supabase dhe lexon tabelën `diagnozat`, e shfaq në telefon (Expo Go).

## Çka bëri agjenti
- Rregulloi importin e `utils/supabase.ts` (path i gabuar).
- Diagnostikoi gabimet e lidhjes: URL e gabuar (`/rest/v1`), çelës i paplotë.
- Krijoi tabelën `diagnozat` me RLS dhe policy leximi.

## Çka mbetet
- M2: shtimi i të dhënave nga telefoni (INSERT) dhe ruajtja.
- M3: ekrani kryesor i HARTA-s me të dhëna reale.
