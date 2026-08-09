import {
  ActivityIndicator,
  Image,
  Pressable,
  TextInput,
  View,
  Text,
} from 'react-native';
import { OnlineUser } from '../../types';
import { CameraIcon, CloseIcon, SearchIcon } from '../../assets/Icon';

type SearchProps = {
  searchOpen: boolean;
  onToggleSearch: () => void;
  searchQuery: string;
  onChangeSearchQuery: (value: string) => void;
  searchResults: OnlineUser[];
  isSearching: boolean;
  onSelectUser: (user: OnlineUser) => void;
  onPressLocket: () => void;
  locketUnreadCount: number;
};

export default function Search({
  searchOpen,
  onToggleSearch,
  searchQuery,
  onChangeSearchQuery,
  searchResults,
  isSearching,
  onSelectUser,
  onPressLocket,
  locketUnreadCount,
}: SearchProps) {
  return (
    <View className="bg-[#FDFDFD]/95 dark:bg-[#0c1014]/95 px-4 pt-2 pb-3 border-b border-gray-100 dark:border-white/5">
      <View className="flex-row items-center justify-between">
        {searchOpen ? (
          <View className="flex-1 flex-row items-center gap-2 bg-gray-100 dark:bg-[#1A1A27] px-3 py-2 rounded-full">
            <SearchIcon size={18} />
            <TextInput
              autoFocus
              value={searchQuery}
              onChangeText={onChangeSearchQuery}
              placeholder="Search users..."
              placeholderTextColor="#9CA3AF"
              textBreakStrategy="simple"
              className="flex-1 text-sm text-gray-900 dark:text-gray-100 py-0"
            />
            {isSearching && <ActivityIndicator size="small" color="#6366F1" />}
            <Pressable
              onPress={onToggleSearch}
              hitSlop={8}
              className="w-6 h-6 items-center justify-center"
            >
              <CloseIcon size={18} />
            </Pressable>
          </View>
        ) : (
          <>
            <Text className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Vibenet
            </Text>
            <View className="flex-row items-center gap-2">
              <Pressable
                onPress={onPressLocket}
                hitSlop={8}
                className="w-9 h-9 rounded-full bg-gray-100 dark:bg-[#1A1A27] items-center justify-center"
              >
                <CameraIcon size={18} />
                {locketUnreadCount > 0 && (
                  <View className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-indigo-600 items-center justify-center">
                    <Text className="text-white text-[10px] font-bold">
                      {locketUnreadCount > 9 ? '9+' : locketUnreadCount}
                    </Text>
                  </View>
                )}
              </Pressable>
              <Pressable
                onPress={onToggleSearch}
                hitSlop={8}
                className="w-9 h-9 rounded-full bg-gray-100 dark:bg-[#1A1A27] items-center justify-center"
              >
                <SearchIcon size={18} />
              </Pressable>
            </View>
          </>
        )}
      </View>

      {searchOpen && searchQuery.trim().length > 0 && (
        <View className="mt-3 bg-white dark:bg-[#1A1A27] border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden max-h-72">
          {isSearching ? (
            <Text className="p-4 text-center text-sm text-gray-500">
              Searching...
            </Text>
          ) : searchResults.length > 0 ? (
            searchResults.map(user => (
              <Pressable
                key={user.id}
                onPress={() => onSelectUser(user)}
                className="flex-row items-center gap-3 p-3 active:bg-gray-50 dark:active:bg-white/5"
              >
                <View className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                  <Image
                    source={{ uri: user.avatar }}
                    className="w-full h-full"
                  />
                </View>
                <View>
                  <Text className="text-sm font-medium text-gray-900 dark:text-white">
                    {user.name}
                  </Text>
                  <Text className="text-xs text-gray-500">@{user.handle}</Text>
                </View>
              </Pressable>
            ))
          ) : (
            <Text className="p-4 text-center text-sm text-gray-500">
              No users found
            </Text>
          )}
        </View>
      )}
    </View>
  );
}
