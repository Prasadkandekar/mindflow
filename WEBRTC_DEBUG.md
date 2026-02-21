# WebRTC Voice Companion Debugging Guide

## Changes Made

### 1. Added Missing Android Permissions
Added to `app.json`:
- `BLUETOOTH_CONNECT` - Required for Bluetooth audio routing
- `ACCESS_WIFI_STATE` - Required for network state detection
- `CHANGE_WIFI_STATE` - Required for WiFi network switching

### 2. Enhanced Logging
Added comprehensive console logs to track:
- Audio session initialization
- LiveKit connection status
- Token validation
- Room connection/disconnection events
- Control button interactions

### 3. Added Error Handling
- Validates token and URL before connecting
- Shows user-friendly error messages
- Logs all connection errors

## How to Debug

### Step 1: Check Logs
When running the app, watch for these log messages:

```
[AudioSession] Starting audio session...
[AudioSession] Audio session started successfully
[LiveKit] Connecting to: wss://mental-wellness-3z07873b.livekit.cloud
[LiveKit] Token length: XXX
[LiveKit] ✅ Successfully connected to room
```

### Step 2: Common Issues

#### Issue: "LiveKit native module not found"
**Solution**: You must build a development build, not use Expo Go
```bash
npx expo run:android
# or
eas build --profile development --platform android
```

#### Issue: "Missing connection details"
**Solution**: Check your token server is running and accessible
- Test: `curl https://voice-agent-token-generator.onrender.com/getToken`
- Should return: `{"token": "...", "success": true}`

#### Issue: Audio session fails to start
**Solution**: 
1. Check microphone permissions are granted
2. Restart the app
3. Check Android audio settings

#### Issue: WebRTC connection fails
**Possible causes**:
1. Invalid or expired token
2. Network firewall blocking WebRTC
3. Server URL incorrect
4. Missing permissions

### Step 3: Test Connection Manually

Run this in your terminal to test the token server:
```bash
curl https://voice-agent-token-generator.onrender.com/getToken
```

### Step 4: Check Permissions

On Android device:
1. Go to Settings > Apps > MindFlow
2. Check Permissions:
   - Microphone: Allowed
   - Camera: Allowed (if using video)
3. If denied, enable them and restart app

### Step 5: Network Requirements

WebRTC requires:
- UDP ports 50000-60000 open
- STUN/TURN server access
- Stable internet connection
- No restrictive firewall

## Building the App

### Development Build (Recommended for testing)
```bash
cd MoonDiary
eas build --profile development --platform android
```

### Preview Build
```bash
eas build --profile preview --platform android
```

### Production Build
```bash
eas build --profile production --platform android
```

## Testing Checklist

- [ ] Token server is accessible
- [ ] App has microphone permission
- [ ] Audio session starts successfully
- [ ] LiveKit connects to room
- [ ] Can toggle microphone on/off
- [ ] Can see transcriptions
- [ ] Can send chat messages
- [ ] Can exit session cleanly

## Additional Notes

- This feature WILL NOT work in Expo Go
- You must create a development build or use EAS Build
- WebRTC requires real device testing (emulator may have issues)
- Check React Native logs: `npx react-native log-android`
