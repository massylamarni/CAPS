import ButtonListItem from '../mini-components/buttonListItem';
import { View, ScrollView } from 'react-native';
import { resetDatabase } from '@/utils/sqlite_db_p';
import { useLogs } from '@/utils/logContext';
import Tex from '../base-components/tex';
import SimpleCard from '../mini-components/simpleCard';
import { lang } from '@/assets/languages/lang-provider';

const TAG = "P/settingsComponent";

export default function SettingsComponentP({ setRole }: { setRole: any}) {
  const { logs, addLog } = useLogs();
  
  return (
    <>
      <SimpleCard title={lang["settings"]}>
        <ButtonListItem
          onPressE={() => setRole((prev: 'CENTRAL' | 'PERIPHERAL') => (prev === 'CENTRAL' ? 'PERIPHERAL' : 'CENTRAL'))}
          label={lang["switch_roles"]}
        />
        <ButtonListItem
          onPressE={() => resetDatabase()}
          label={lang["reset_database"]}
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
  