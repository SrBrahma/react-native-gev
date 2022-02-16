// import { useEffect, useRef, useState } from 'react';
// import { Platform } from 'react-native';
// import Constants from 'expo-constants';
// import type { Subscription } from 'expo-modules-core';
// import * as Notifications from 'expo-notifications';
// import { retry } from 'ts-retry-promise';
// import { useTheme } from '../main';



// // From https://docs.expo.dev/versions/latest/sdk/notifications/#api

// Notifications.setNotificationHandler({
//   // eslint-disable-next-line @typescript-eslint/require-await
//   handleNotification: async () => ({
//     shouldShowAlert: true,
//     shouldPlaySound: true,
//     shouldSetBadge: false,
//     priority: Notifications.AndroidNotificationPriority.MAX,
//   }),
// });

// type UseNotificationsProps = {
//   /** Will only call onTokenChange if this is true.
//    *
//    * This is also useful as if your user logs out then login with another account, this can turn false the true,
//    * triggering onTokenChange call again.
//    *
//    * @default true */
//   active?: boolean;
//   /** Required for EAS / Bare.
//    * https://docs.expo.dev/versions/latest/sdk/notifications/#arguments */
//   experienceId?: string;
//   /** Callback to be called when token changes. */
//   onTokenChange?: (props: {token: string}) => void;
// };
// export function useNotifications({ experienceId, onTokenChange, active = true }: UseNotificationsProps = {}): void {
//   const { colors: { primary } } = useTheme();
//   const [token, setToken] = useState<string | undefined>();
//   const [, setNotification] = useState<Notifications.Notification | undefined>();
//   const notificationListener = useRef<Subscription>();
//   const responseListener = useRef<Subscription>();

//   // Reset token on uid change and load new one if uid is set.
//   useEffect(() => {
//     setToken(undefined);
//     void retry(async () => {
//       // We used to check if the uid was still the same after the await, but not need to do it so as the token doesn't change.
//       const token = await registerForPushNotificationsAsync({ experienceId, lightColor: primary });
//       setToken(token); // Only set if same uid. Will cancel otherwise.
//     }, { retries: 'INFINITELY', timeout: 'INFINITELY', delay: 3000 });
//   }, [experienceId, primary]);

//   /** Call onTokenChange. */
//   useEffect(() => { active && token && onTokenChange?.({ token }); }, [active, token, onTokenChange]);

//   useEffect(() => {
//     notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
//       setNotification(notification);
//     });

//     responseListener.current = Notifications.addNotificationResponseReceivedListener(() => {
//       // console.log(response);
//     });

//     return () => {
//       if (notificationListener.current) Notifications.removeNotificationSubscription(notificationListener.current);
//       if (responseListener.current) Notifications.removeNotificationSubscription(responseListener.current);
//     };
//   }, [experienceId, onTokenChange]);

// }



// // async function schedulePushNotification() {
// //   await Notifications.scheduleNotificationAsync({
// //     content: {
// //       title: "You've got mail! 📬",
// //       body: 'Here is the notification body',
// //       data: { data: 'goes here' },
// //     },
// //     trigger: { seconds: 2 },
// //   });
// // }

// async function registerForPushNotificationsAsync({ experienceId, lightColor }: {
//   experienceId?: string;
//   lightColor: string;
// }) {
//   let token;
//   if (Constants.isDevice) {
//     const { status: existingStatus } = await Notifications.getPermissionsAsync();
//     let finalStatus = existingStatus;
//     if (existingStatus !== 'granted') {
//       const { status } = await Notifications.requestPermissionsAsync();
//       finalStatus = status;
//     }
//     if (finalStatus !== 'granted') {
//       alert('Failed to get push token for push notification!');
//       return;
//     }
//     token = (await Notifications.getExpoPushTokenAsync({ experienceId })).data;
//     // console.log(token);
//   } else {
//     alert('Must use physical device for Push Notifications');
//   }

//   if (Platform.OS === 'android') {
//     void Notifications.setNotificationChannelAsync('default', {
//       name: 'default',
//       importance: Notifications.AndroidImportance.MAX,
//       vibrationPattern: [0, 250, 250, 250],
//       lightColor,
//     });
//   }

//   return token;
// }
