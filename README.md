# nfMobile - React Native App

A comprehensive React Native mobile application for course/education management with features including user authentication, calendar management, messaging, payments, and profile management.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Project Structure](#project-structure)
- [Architecture](#architecture)
- [Key Dependencies](#key-dependencies)
- [Development](#development)
- [Building & Deployment](#building--deployment)
- [Contributing](#contributing)
- [Troubleshooting](#troubleshooting)

## Overview

nfMobile is a React Native application designed for educational institutions and course management. The app provides a comprehensive platform for students and administrators to manage courses, track payments, communicate via messages, and access educational content.

### Key Features

- **Authentication System**: Login, forgot password, and user switching
- **Calendar Management**: View and manage educational schedules
- **Messaging System**: Email and SMS communications
- **Payment Management**: Payment tracking and EMI (Equated Monthly Installment) management
- **Profile Management**: User profiles with course information
- **Gallery**: Media content management
- **Notifications**: Real-time notification system
- **Multi-language Support**: English and Italian localization

## Prerequisites

Before setting up the project, ensure you have the following installed:

- **Node.js**: Version 18 or higher
- **React Native Development Environment**: Follow the [React Native Environment Setup](https://reactnative.dev/docs/set-up-your-environment)
- **Android Studio** (for Android development)
- **Xcode** (for iOS development - macOS only)
- **CocoaPods** (for iOS dependencies)
- **Git**

## Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd nfMobile
```

### 2. Install Dependencies

```bash
# Install Node.js dependencies
npm install

# For iOS, install CocoaPods dependencies
cd ios && bundle install && bundle exec pod install && cd ..
```

### 3. Environment Configuration

The app uses environment-specific configurations. Ensure you have the necessary API endpoints and keys configured in your environment.

### 4. Run the Application

#### Start Metro Bundler
```bash
npm start
```

#### Run on Android
```bash
npm run android
```

#### Run on iOS
```bash
npm run ios
```

## Project Structure

```
nfMobile/
├── android/                     # Android-specific files
├── ios/                         # iOS-specific files
├── src/                         # Source code
│   ├── components/              # Reusable UI components
│   │   ├── AlertLabel.tsx       # Alert/notification labels
│   │   ├── BottomNavigation.tsx # Custom bottom navigation
│   │   ├── Calendar.tsx         # Calendar component with events
│   │   ├── Header.tsx           # Custom header component
│   │   ├── Image.tsx            # Enhanced image component
│   │   ├── ImageBackground.tsx  # Enhanced image background
│   │   ├── Layout.tsx           # Layout container components
│   │   ├── Pressable.tsx        # Enhanced pressable component
│   │   ├── RefreshControl.tsx   # Custom refresh control
│   │   ├── ScrollView.tsx       # Enhanced scroll view
│   │   ├── Sticker.tsx          # Sticker/badge component
│   │   ├── Typography.tsx       # Text components with theming
│   │   ├── common.ts            # Common component utilities
│   │   └── index.ts             # Component exports
│   ├── helpers/                 # Utility functions and services
│   │   ├── applicationUtils.ts  # App-specific utilities
│   │   ├── dateUtils.ts         # Date manipulation utilities
│   │   ├── generalUtils.ts      # General purpose utilities
│   │   ├── request.ts           # API service and HTTP client
│   │   ├── secureStorage.ts     # Secure storage utilities
│   │   ├── theme.ts             # Theme configuration
│   │   └── index.ts             # Helper exports
│   ├── hooks/                   # Custom React hooks
│   │   ├── useApi.ts            # API state management hooks
│   │   ├── useAsyncStorage.ts   # Async storage hooks
│   │   ├── useCollection.ts     # Collection data management
│   │   ├── useDebounce.ts       # Debouncing hooks
│   │   ├── useForm.ts           # Form state management
│   │   ├── useRefresh.ts        # Refresh functionality
│   │   ├── useToggle.ts         # Toggle state hooks
│   │   └── index.ts             # Hook exports
│   ├── navigation/              # Navigation configuration
│   │   ├── AppNavigator.tsx     # Main stack navigator
│   │   ├── TabNavigator.tsx     # Bottom tab navigator
│   │   └── types.ts             # Navigation type definitions
│   ├── screens/                 # Application screens
│   │   ├── CalendarScreen.tsx   # Calendar view and management
│   │   ├── EmailScreen.tsx      # Email detail view
│   │   ├── EMIScreen.tsx        # EMI payment details
│   │   ├── ForgotPasswordScreen.tsx # Password recovery
│   │   ├── GalleryScreen.tsx    # Media gallery
│   │   ├── LoaderScreen.tsx     # Loading screen
│   │   ├── LoginScreen.tsx      # User authentication
│   │   ├── MessagesScreen.tsx   # Message list and management
│   │   ├── NotificationScreen.tsx # Notification center
│   │   ├── PaymentsScreen.tsx   # Payment management
│   │   ├── ProfileScreen.tsx    # User profile and courses
│   │   ├── SMSScreen.tsx        # SMS conversation view
│   │   ├── SwitchUserScreen.tsx # User switching interface
│   │   └── index.ts             # Screen exports
│   ├── assets/                  # Static assets
│   │   └── images/              # Image assets and icons
│   └── App.tsx                  # Root application component
├── __tests__/                   # Test files
├── package.json                 # Project dependencies and scripts
├── tsconfig.json               # TypeScript configuration
├── babel.config.js             # Babel configuration
├── metro.config.js             # Metro bundler configuration
├── jest.config.js              # Jest testing configuration
└── README.md                   # This file
```

## Architecture

### Navigation Structure

The app uses a hybrid navigation structure:

1. **Stack Navigator** (`AppNavigator.tsx`): Main navigation container
   - Login flow
   - Modal screens (ForgotPassword, SwitchUser)
   - Detail screens (Email, SMS, Notifications, Payments, EMI)

2. **Tab Navigator** (`TabNavigator.tsx`): Main app tabs
   - Calendar Tab
   - Messages Tab
   - Profile Tab (default)
   - Gallery Tab

### State Management

- **React Query**: API state management and caching
- **Zustand**: Global state management (if needed)
- **Custom Hooks**: Local state management for specific features

### Data Flow

1. **API Layer**: Centralized API service (`helpers/request.ts`)
2. **Custom Hooks**: Data fetching and state management (`hooks/`)
3. **Components**: UI rendering with props and callbacks
4. **Storage**: Secure storage for authentication tokens (`helpers/secureStorage.ts`)

### Theming System

The app uses a comprehensive theming system (`helpers/theme.ts`):
- Material Design 3 color system
- Custom color palette
- Typography scales
- Spacing system
- Shadow definitions
- Icon sizes

## Key Dependencies

### Core React Native
- **react-native**: Core React Native framework
- **react**: React library
- **typescript**: Type safety

### Navigation
- **@react-navigation/native**: Navigation framework
- **@react-navigation/native-stack**: Stack navigation
- **@react-navigation/bottom-tabs**: Tab navigation

### UI & Styling
- **react-native-paper**: Material Design components
- **react-native-vector-icons**: Icon library (Feather icons)
- **react-native-safe-area-context**: Safe area handling

### State Management & Data
- **@tanstack/react-query**: Server state management
- **zustand**: Client state management
- **axios**: HTTP client

### Storage & Security
- **react-native-keychain**: Secure storage for sensitive data
- **react-native-mmkv**: Fast key-value storage

### Utilities
- **date-fns**: Date manipulation
- **react-native-haptic-feedback**: Haptic feedback

## Development

### Available Scripts

```bash
# Start Metro bundler
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios

# Run linting
npm run lint

# Run tests
npm test
```

### Code Style & Standards

The project follows these conventions:

1. **TypeScript**: Strict type checking enabled
2. **ESLint**: Code linting with React Native config
3. **Prettier**: Code formatting
4. **Component Structure**: Functional components with TypeScript interfaces
5. **File Naming**: PascalCase for components, camelCase for utilities
6. **Export Pattern**: Named exports from index files

### Custom Components

The app includes a comprehensive set of custom components:

- **AlertLabel**: Styled alert messages with different types
- **BottomNavigation**: Custom bottom navigation with logout functionality
- **Calendar**: Full-featured calendar with event support
- **Header**: Customizable header with back navigation
- **Typography**: Themed text components
- **Layout Components**: Containers with theming support

### Custom Hooks

Reusable hooks for common functionality:

- **useApi**: API calls with loading, error, and success states
- **useCollection**: Paginated data collections
- **useForm**: Form state management with validation
- **useRefresh**: Pull-to-refresh functionality
- **useDebounce**: Debouncing for search and input

### Utility Functions

Helper functions organized by category:

- **applicationUtils**: User profile and app-specific utilities
- **dateUtils**: Date formatting and manipulation
- **generalUtils**: Generic utility functions
- **secureStorage**: Secure data storage

## Building & Deployment

### Android

1. **Debug Build**:
   ```bash
   npm run android
   ```

2. **Release Build**:
   ```bash
   cd android
   ./gradlew assembleRelease
   ```

### iOS

1. **Debug Build**:
   ```bash
   npm run ios
   ```

2. **Release Build**:
   - Open `ios/nfMobile.xcworkspace` in Xcode
   - Select "Generic iOS Device" or your target device
   - Product → Archive

### Environment Configuration

Before building for production:

1. Update API endpoints in the request helper
2. Configure proper bundle identifiers
3. Set up code signing (iOS)
4. Update app icons and splash screens
5. Configure app store metadata

## Contributing

### Development Workflow

1. **Create Feature Branch**: `git checkout -b feature/your-feature-name`
2. **Make Changes**: Follow the coding standards
3. **Test**: Ensure all tests pass and no linting errors
4. **Commit**: Use descriptive commit messages
5. **Push**: `git push origin feature/your-feature-name`
6. **Pull Request**: Create a PR with description of changes

### Code Quality

Before submitting code:

1. Run linting: `npm run lint`
2. Run tests: `npm test`
3. Test on both Android and iOS
4. Ensure TypeScript compilation passes
5. Check for any console warnings/errors

## Troubleshooting

### Common Issues

1. **Metro Bundle Issues**:
   ```bash
   npx react-native start --reset-cache
   ```

2. **iOS CocoaPods Issues**:
   ```bash
   cd ios && bundle exec pod install --clean-install
   ```

3. **Android Build Issues**:
   ```bash
   cd android && ./gradlew clean && cd ..
   ```

4. **TypeScript Errors**:
   - Check `tsconfig.json` configuration
   - Ensure all dependencies have type definitions

5. **Navigation Issues**:
   - Verify navigation types in `navigation/types.ts`
   - Check navigation parameter passing

### Performance Optimization

- Use `React.memo` for expensive components
- Implement `FlatList` for large data sets
- Optimize images and assets
- Use React Query for efficient data caching
- Monitor bundle size and loading times

### Debugging

- **React Native Debugger**: Enhanced debugging experience
- **Flipper**: Advanced debugging and profiling
- **Console Logs**: Use `console.log` for development debugging
- **React DevTools**: Component tree inspection

## Additional Resources

- [React Native Documentation](https://reactnative.dev/docs/getting-started)
- [React Navigation Documentation](https://reactnavigation.org/docs/getting-started)
- [React Native Paper](https://reactnativepaper.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Query Documentation](https://tanstack.com/query/latest)

---

For questions or support, please contact the development team or create an issue in the project repository.