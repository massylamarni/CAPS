import ButtonListItem from '../mini-components/buttonListItem';
import { View, ScrollView } from 'react-native';
import { resetDatabase } from '@/utils/sqlite_db_c';
import { useLogs } from '@/utils/logContext';
import { useLangs } from "@/utils/langContext";
import Tex from '../base-components/tex';
import SimpleCard from '../mini-components/simpleCard';
import styles from '@/assets/styles';
import CollapsibleButton from '../mini-components/collaplisbleButton';
import StateButton from '../mini-components/stateButton';

const TAG = "C/settingsComponent";

export default function SettingsComponentC({ setSettings, setRole, setDbStats }: { setSettings: any, setRole: any, setDbStats: any }) {
  const { logs, addLog } = useLogs();
  const { lang, updateLangTo } = useLangs();

  return (
    <>
      <SimpleCard title={lang["settings"]}>
        <CollapsibleButton value={lang["change_language"]} options={[lang["french"], lang["english"], lang["arabic"]]} onPressE={
          [
            () => updateLangTo("fr"),
            () => updateLangTo("en"),
            () => updateLangTo("ar")
          ]
        }/>
        <StateButton
          onPressE={() => setSettings((prev: any) => ({...prev, isSimulating: !prev.isSimulating }))}
          label={lang["simulate_data_reception"]}
        />
        <ButtonListItem
          onPressE={() => setRole((prev: 'CENTRAL' | 'PERIPHERAL') => (prev === 'CENTRAL' ? 'PERIPHERAL' : 'CENTRAL'))}
          label={lang["switch_roles"]}
          warning={lang["you_are_about_to_change_roles"]}
        />
        <ButtonListItem
          onPressE={() => {
            resetDatabase();
            setDbStats({
              last_read: 0,
              last_row: null,
              row_count: 0,
            });
          }}
          label={lang["reset_database"]}
          warning={lang["you_are_about_to_reset_the_database"]}
        />
      </SimpleCard>

      <SimpleCard title={lang["logs"]}>
        <ScrollView>
          {logs.map((log, index) => (
            <Tex key={index}>{log}</Tex>
          ))}
        </ScrollView>
      </SimpleCard>
    </>
  );
}
  