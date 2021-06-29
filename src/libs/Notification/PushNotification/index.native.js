import _ from 'underscore';
import {AppState} from 'react-native';
import {UrbanAirship, EventType} from 'urbanairship-react-native';
import lodashGet from 'lodash/get';
import NotificationType from './NotificationType';

const notificationEventActionMap = {};

/**
 * Handle a push notification event, and trigger and bound actions.
 *
 * @param {String} eventType
 * @param {Object} notification
 */
function pushNotificationEventCallback(eventType, notification) {
    const actionMap = notificationEventActionMap[eventType] || {};
    let payload = lodashGet(notification, 'extras.payload');

    // On Android, some notification payloads are sent as a JSON string rather than an object
    if (_.isString(payload)) {
        payload = JSON.parse(payload);
    }

    console.debug(`[PUSH_NOTIFICATION] ${eventType}`, {
        title: notification.title,
        message: notification.alert,
        payload,
    });

    if (!payload) {
        console.debug('[PUSH_NOTIFICATION] Notification has null or undefined payload, not executing any callback.');
        return;
    }

    if (!payload.type) {
        console.debug('[PUSH_NOTIFICATION] No type value provided in payload, not executing any callback.');
        return;
    }

    const action = actionMap[payload.type];
    if (!action) {
        console.debug('[PUSH_NOTIFICATION] No callback set up: ', {
            event: eventType,
            notificationType: payload.type,
        });
        return;
    }
    action(payload);
}

/**
 * Register this device for push notifications for the given accountID.
 *
 * @param {String|Number} accountID
 */
function register(accountID) {
    Promise.all([
        UrbanAirship.getNamedUser(),
        UrbanAirship.enableUserPushNotifications(),
    ])
        .then(([namedUser, arePushNotificationsEnabled]) => {
            if (!arePushNotificationsEnabled) {
                console.debug('[PUSH_NOTIFICATIONS] User has disabled visible push notifications for this app.');
            }

            if (namedUser === accountID.toString()) {
                console.debug('[PUSH_NOTIFICATIONS] This user is already registered for push notifications.');
            } else {
                // Register this device as a named user in AirshipAPI.
                // Regardless of the user's opt-in status, we still want to receive silent push notifications.
                console.debug(`[PUSH_NOTIFICATIONS] Subscribing to notifications for account ID ${accountID}`);
                UrbanAirship.setNamedUser(accountID.toString());
            }

            // Setup event listeners
            UrbanAirship.addListener(EventType.PushReceived, (notification) => {
                console.debug('RORY_DEBUG PushReceived callback executed');

                // If a push notification is received while the app is in foreground,
                // we'll assume pusher is connected so we'll ignore is and not fetch the same data twice.
                if (AppState.currentState === 'active') {
                    // eslint-disable-next-line max-len
                    console.debug('[PUSH_NOTIFICATION] Push received while app is in foreground, not executing any callback.');
                    return;
                }

                pushNotificationEventCallback(EventType.PushReceived, notification);
            });

            // Note: the NotificationResponse event has a nested PushReceived event,
            // so event.notification refers to the same thing as notification above ^
            UrbanAirship.addListener(EventType.NotificationResponse, (event) => {
                console.debug('RORY_DEBUG NotificationResponse callback executed');
                pushNotificationEventCallback(EventType.NotificationResponse, event.notification);
            });
        });
}

/**
 * Deregister this device from push notifications.
 */
function deregister() {
    console.debug('[PUSH_NOTIFICATIONS] Unsubscribing from push notifications.');
    UrbanAirship.setNamedUser(null);
    UrbanAirship.removeAllListeners(EventType.PushReceived);
    UrbanAirship.removeAllListeners(EventType.NotificationResponse);
}

/**
 * Bind a callback to a push notification of a given type.
 * See https://github.com/Expensify/Web-Expensify/blob/main/lib/MobilePushNotifications.php for the various
 * types of push notifications sent, along with the data that they provide.
 *
 * Note: This implementation allows for only one callback to be bound to an Event/Type pair. For example,
 *       if we attempt to bind two callbacks to the PushReceived event for reportComment notifications,
 *       the second will overwrite the first.
 *
 * @param {String} notificationType
 * @param {Function} callback
 * @param {String} [triggerEvent] - The event that should trigger this callback. Should be one of UrbanAirship.EventType
 */
function bind(notificationType, callback, triggerEvent) {
    if (!notificationEventActionMap[triggerEvent]) {
        notificationEventActionMap[triggerEvent] = {};
    }
    notificationEventActionMap[triggerEvent][notificationType] = callback;
}

/**
 * Bind a callback to be executed when a push notification of a given type is received.
 *
 * @param {String} notificationType
 * @param {Function} callback
 */
function onReceived(notificationType, callback) {
    bind(notificationType, callback, EventType.PushReceived);
}

/**
 * Bind a callback to be executed when a push notification of a given type is tapped by the user.
 *
 * @param {String} notificationType
 * @param {Function} callback
 */
function onSelected(notificationType, callback) {
    bind(notificationType, callback, EventType.NotificationResponse);
}

export default {
    register,
    deregister,
    onReceived,
    onSelected,
    TYPE: NotificationType,
};
