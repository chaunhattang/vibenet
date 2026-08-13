/**
 * MainTabs — the 4 primary destinations (Home / Explore / Notifications /
 * Profile), switched entirely via local state instead of pushing new
 * screens onto the stack.
 *
 * All 4 screens mount once and stay mounted (hidden with `display: none`
 * when inactive), so switching tabs is an instant show/hide instead of a
 * fresh push + remount + re-fetch on every tap.
 */
import { StyleSheet, View } from 'react-native';
import ExploreScreen from '../screens/ExploreScreen';
import NewsfeedScreen from '../screens/NewsfeedScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { useActiveTab } from '../contexts/ActiveTabContext';
import { TabKey } from '../layout/FloatingTabBar';
import MainTabBar from './MainTabBar';

const TABS: { key: TabKey; Screen: React.ComponentType }[] = [
  { key: 'home', Screen: NewsfeedScreen },
  { key: 'explore', Screen: ExploreScreen },
  { key: 'notifications', Screen: NotificationsScreen },
  { key: 'profile', Screen: ProfileScreen },
];

export default function MainTabs() {
  const { activeTab } = useActiveTab();

  return (
    <View style={styles.container}>
      {TABS.map(({ key, Screen }) => (
        <View
          key={key}
          style={[styles.screen, { display: activeTab === key ? 'flex' : 'none' }]}
        >
          <Screen />
        </View>
      ))}
      <MainTabBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  screen: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
});
