module.exports = {
    appId: 'com.expensifyreactnative.chat',
    productName: 'Chat',
    mac: {
        category: 'public.app-category.finance',
        icon: './android/app/src/main/res/mipmap-xxxhdpi/ic_launcher_round.png',
        hardenedRuntime: true,
        entitlements: 'desktop/entitlements.mac.plist',
        entitlementsInherit: 'desktop/entitlements.mac.plist',
        type: 'distribution'
    },
    dmg: {
        title: 'Chat',
        artifactName: 'Chat.dmg',
        internetEnabled: true
    },
    files: [
        './dist/**/*',
        './main.js',
        './desktop/*.js',
        './desktop/ELECTRON_EVENTS.js',
    ]
};
