# nfMobile - React Native App

A comprehensive React Native mobile application for course/education management with advanced features including user authentication, calendar management, messaging, payments, enhanced gallery with PDF export, file management, and real-time notifications.

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

nfMobile is a React Native application designed for educational institutions and course management. The app provides a comprehensive platform for students and administrators to manage courses, track payments, communicate via messages, and access educational content with advanced file management and notification capabilities.

### Key Features

- **Authentication System**: Secure login, forgot password, and user switching with token management
- **Enhanced Gallery**: Advanced media management with PDF export, file downloads, permissions handling
- **Calendar Management**: Interactive calendar with event management and localization
- **Messaging System**: Email and SMS communications with real-time updates
- **Payment Management**: Comprehensive payment tracking and EMI (Equated Monthly Installment) management
- **Profile Management**: User profiles with course information and avatar generation
- **File Management**: Advanced file system operations, downloads, and PDF generation
- **Notifications**: Real-time push notifications with local scheduling and custom channels
- **Multi-language Support**: Complete i18n implementation with English and Italian localization
- **Form Management**: Advanced form handling with validation and error management
- **Theming System**: Comprehensive Material Design 3 theming with custom components

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
│   │   ├── AlertLabel.tsx       # Alert/notification labels with type variants
│   │   ├── BottomNavigation.tsx # Custom bottom navigation with logout
│   │   ├── Calendar.tsx         # Full-featured calendar with events
│   │   ├── Header.tsx           # Customizable header with navigation
│   │   ├── Image.tsx            # Enhanced image with loading states
│   │   ├── ImageBackground.tsx  # Enhanced image background wrapper
│   │   ├── LanguageSelector.tsx # Multi-language selection component
│   │   ├── Layout.tsx           # Themed layout container components
│   │   ├── LegacyButton.tsx     # Legacy-styled button component
│   │   ├── LegacyInput.tsx      # Legacy-styled input with validation
│   │   ├── Pressable.tsx        # Enhanced pressable with haptic feedback
│   │   ├── RefreshControl.tsx   # Custom refresh control wrapper
│   │   ├── ScrollView.tsx       # Enhanced scroll view with keyboard handling
│   │   ├── Sticker.tsx          # Collapsible sticker/badge component
│   │   ├── Typography.tsx       # Comprehensive text components with theming
│   │   ├── common.ts            # Common component utilities
│   │   └── index.ts             # Component exports
│   ├── features/                # Feature-specific modules
│   │   └── gallery/             # Enhanced gallery feature
│   │       ├── components/      # Gallery-specific components
│   │       │   ├── GalleryHeader.tsx      # Gallery header with download options
│   │       │   ├── GalleryItem.tsx        # Individual gallery item with selection
│   │       │   ├── GallerySelectionBar.tsx # Selection bar with bulk operations
│   │       │   └── GradientView.tsx       # Gradient background component
│   │       ├── screens/         # Gallery screens
│   │       │   └── EnhancedGalleryScreen.tsx # Main gallery screen with advanced features
│   │       ├── services/        # Gallery services
│   │       │   ├── FileSystemService.ts   # File system operations and downloads
│   │       │   ├── GalleryService.ts      # Gallery data management and operations
│   │       │   ├── PDFService.ts          # PDF generation and export
│   │       │   └── PermissionsService.ts  # File and camera permissions handling
│   │       ├── types.ts         # Gallery-specific type definitions
│   │       └── index.ts         # Gallery feature exports
│   ├── helpers/                 # Utility functions and services
│   │   ├── applicationUtils.ts  # User profile and app-specific utilities
│   │   ├── dateUtils.ts         # Date manipulation with i18n support
│   │   ├── generalUtils.ts      # Comprehensive utility functions
│   │   ├── request.ts           # Enhanced API service with interceptors
│   │   ├── secureStorage.ts     # Secure storage with error handling
│   │   ├── theme.ts             # Material Design 3 theme system
│   │   └── index.ts             # Helper exports
│   ├── hooks/                   # Custom React hooks
│   │   ├── useApi.ts            # Advanced API state management hooks
│   │   ├── useAsyncStorage.ts   # Secure storage hooks with multiple keys
│   │   ├── useCollection.ts     # Paginated collection data management
│   │   ├── useDebounce.ts       # Debouncing and throttling hooks
│   │   ├── useForm.ts           # Form state with validation framework
│   │   ├── useNotifications.ts  # Notification management hooks
│   │   ├── useRefresh.ts        # Pull-to-refresh functionality
│   │   ├── useToggle.ts         # Toggle state management
│   │   ├── useTranslation.ts    # i18n translation hooks
│   │   └── index.ts             # Hook exports
│   ├── locales/                 # Internationalization
│   │   ├── en/                  # English translations
│   │   │   └── translation.json
│   │   ├── it/                  # Italian translations
│   │   │   └── translation.json
│   │   └── i18n.ts              # i18n configuration and utilities
│   ├── navigation/              # Navigation configuration
│   │   ├── AppNavigator.tsx     # Main stack navigator with auth flow
│   │   ├── TabNavigator.tsx     # Bottom tab navigator with icons
│   │   └── types.ts             # Comprehensive navigation type definitions
│   ├── screens/                 # Application screens
│   │   ├── CalendarScreen.tsx   # Interactive calendar with event management
│   │   ├── EmailScreen.tsx      # Email detail view with full content
│   │   ├── EMIScreen.tsx        # EMI payment details with status tracking
│   │   ├── ForgotPasswordScreen.tsx # Password recovery with validation
│   │   ├── GalleryScreen.tsx    # Legacy gallery (replaced by enhanced version)
│   │   ├── LoaderScreen.tsx     # Customizable loading screen
│   │   ├── LoginScreen.tsx      # Authentication with form validation
│   │   ├── MessagesScreen.tsx   # Message list with filtering and navigation
│   │   ├── NotificationDebugScreen.tsx # Notification testing and debugging
│   │   ├── NotificationScreen.tsx # Notification center with actions
│   │   ├── PaymentsScreen.tsx   # Comprehensive payment management
│   │   ├── ProfileScreen.tsx    # User profile with courses and logout
│   │   ├── SMSScreen.tsx        # SMS conversation with message grouping
│   │   ├── SwitchUserScreen.tsx # User switching with search functionality
│   │   └── index.ts             # Screen exports
│   ├── services/                # Global services
│   │   └── NotificationService.ts # Comprehensive notification management
│   ├── types/                   # TypeScript type definitions
│   │   ├── i18next.d.ts         # i18n type augmentation
│   │   └── react-native-html-to-pdf.d.ts # PDF library types
│   ├── assets/                  # Static assets
│   │   └── images/              # Image assets, icons, and backgrounds
│   └── App.tsx                  # Root application component with notifications
├── __tests__/                   # Test files
├── package.json                 # Project dependencies and scripts
├── tsconfig.json               # TypeScript configuration
├── babel.config.js             # Babel configuration
├── metro.config.js             # Metro bundler configuration
├── jest.config.js              # Jest testing configuration
└── README.md                   # This comprehensive documentation
```

## Architecture

### Navigation Structure

The app uses a sophisticated navigation structure with multiple layers:

1. **Stack Navigator** (`AppNavigator.tsx`): Root navigation container
   - Authentication flow (Login, ForgotPassword, SwitchUser)
   - Main application with Tab Navigator
   - Modal and detail screens (Email, SMS, Notifications, Payments, EMI)

2. **Tab Navigator** (`TabNavigator.tsx`): Main app navigation
   - Calendar Tab: Interactive calendar with event management
   - Messages Tab: Email and SMS communications
   - Profile Tab: User profile and course information (default)
   - Gallery Tab: Enhanced media gallery with advanced features

### Feature-Based Architecture

The app follows a feature-based architecture pattern:

1. **Feature Modules** (`src/features/`): Self-contained feature packages
   - Gallery: Complete media management system with components, services, and screens
   - Each feature includes its own components, services, types, and screens

2. **Service Layer**: Singleton service classes for complex operations
   - `NotificationService`: Push and local notification management
   - `GalleryService`: Image selection, download, and PDF export
   - `FileSystemService`: File operations and download management
   - `PDFService`: PDF generation from images and content
   - `PermissionsService`: Platform permission handling

3. **Component Library**: Reusable UI components with theming
   - Base components with consistent styling
   - Legacy components for backward compatibility
   - Feature-specific components

### State Management

- **Local State**: React hooks for component-level state
- **Form State**: Custom `useForm` hook with validation framework
- **API State**: Custom `useApi` and `useCollection` hooks
- **Global State**: Service-based architecture with event emitters
- **Secure Storage**: Token and user data persistence

### Data Flow

1. **API Layer**: Enhanced HTTP client with interceptors and error handling
2. **Service Layer**: Business logic abstraction with singleton patterns
3. **Hook Layer**: State management and side effects
4. **Component Layer**: UI rendering with typed props
5. **Storage Layer**: Secure token storage and user preferences

### Internationalization (i18n)

Complete multi-language support system:
- Dynamic language switching with real-time updates
- Localized date formatting with date-fns
- Translation hooks for components
- Device language detection and fallback

### Theming System

Material Design 3 compliant theming (`helpers/theme.ts`):
- Dynamic color system with semantic naming
- Typography scale with weight variants
- Spacing system with consistent measurements
- Component theming with variant support
- Shadow and elevation definitions
- Icon sizing with accessibility considerations

## Key Dependencies

### Core React Native
- **react-native**: Core React Native framework
- **react**: React library
- **typescript**: Strict type safety and development experience

### Navigation
- **@react-navigation/native**: Navigation framework
- **@react-navigation/native-stack**: Stack navigation with gesture support
- **@react-navigation/bottom-tabs**: Tab navigation with custom styling

### UI & Styling
- **react-native-paper**: Material Design 3 components
- **react-native-vector-icons**: Comprehensive icon library (Feather icons)
- **react-native-safe-area-context**: Safe area handling across platforms
- **react-native-linear-gradient**: Gradient components for enhanced UI

### Enhanced Gallery & File Management
- **react-native-image-picker**: Image selection from camera/gallery
- **react-native-fs**: File system operations and downloads
- **react-native-html-to-pdf**: PDF generation from HTML content
- **react-native-permissions**: Runtime permission handling
- **react-native-document-picker**: Document selection functionality

### Notifications
- **@react-native-firebase/messaging**: Firebase Cloud Messaging
- **@notifee/react-native**: Local notifications with rich features
- **react-native-push-notification**: Cross-platform push notifications

### State Management & Data
- **axios**: Enhanced HTTP client with interceptors
- **Custom Hooks**: Comprehensive state management system

### Storage & Security
- **react-native-keychain**: Secure storage for sensitive data
- **@react-native-async-storage/async-storage**: Persistent storage

### Internationalization
- **react-i18next**: Internationalization framework
- **i18next**: Core i18n functionality
- **react-native-localize**: Device locale detection

### Utilities & Performance
- **date-fns**: Date manipulation with locale support
- **react-native-haptic-feedback**: Tactile feedback system
- **react-native-gesture-handler**: Enhanced gesture recognition
- **react-native-reanimated**: Smooth animations and transitions

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

### Enhanced Feature Set

#### Gallery System
Complete media management with advanced capabilities:
- **Image Selection**: Multi-select with visual feedback
- **File Downloads**: Batch downloading with progress tracking
- **PDF Export**: Convert selected images to PDF documents
- **Permissions**: Runtime permission handling for camera and storage
- **File Management**: Advanced file system operations

#### Notification System
Comprehensive notification management:
- **Push Notifications**: Firebase Cloud Messaging integration
- **Local Notifications**: Scheduled and immediate local notifications
- **Notification Channels**: Organized notification categories
- **Interactive Actions**: Custom notification actions and responses
- **Debug Tools**: Development notification testing screen

#### Form Management
Advanced form handling system:
- **Validation Framework**: Built-in validation rules and custom validators
- **Error Handling**: Field-level and form-level error management
- **State Management**: Comprehensive form state tracking
- **Legacy Support**: Backward-compatible form components

### Custom Components

The app includes an extensive library of custom components:

- **AlertLabel**: Multi-type alert messages with color variants
- **BottomNavigation**: Feature-rich bottom navigation with logout and icons
- **Calendar**: Interactive calendar with event management and localization
- **Header**: Customizable header with navigation and notification support
- **Typography**: Comprehensive text system with theming and variants
- **Layout Components**: Containers with spacing, theming, and safe area support
- **LanguageSelector**: Multi-language selection with flag indicators
- **Legacy Components**: Backward-compatible form inputs and buttons
- **Enhanced Media**: Image and background components with loading states

### Custom Hooks

Sophisticated hooks for complex functionality:

- **useApi**: Advanced API state management with caching and error handling
- **useCollection**: Paginated data collections with filtering and sorting
- **useForm**: Form state management with comprehensive validation framework
- **useNotifications**: Notification management with permission handling
- **useRefresh**: Pull-to-refresh with customizable duration and callbacks
- **useDebounce**: Debouncing and throttling for performance optimization
- **useTranslation**: Internationalization hooks with dynamic language switching
- **useAsyncStorage**: Secure storage hooks with multi-key support

### Service Architecture

Singleton service classes for complex operations:

- **NotificationService**: Complete notification lifecycle management
- **GalleryService**: Image selection, download, and export operations
- **FileSystemService**: File operations, downloads, and storage management
- **PDFService**: PDF generation from images and HTML content
- **PermissionsService**: Platform-specific permission handling

### Utility Functions

Comprehensive helper functions organized by domain:

- **applicationUtils**: User profile management, avatar generation, validation
- **dateUtils**: Internationalized date formatting and manipulation
- **generalUtils**: Object manipulation, string utilities, data transformation
- **secureStorage**: Encrypted data storage with error handling

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

1. **API Configuration**: Update endpoints in `src/helpers/request.ts`
2. **Notification Setup**: Configure Firebase project and notification certificates
3. **Bundle Identifiers**: Update Android `applicationId` and iOS `bundle identifier`
4. **Code Signing**: Set up proper certificates and provisioning profiles (iOS)
5. **Assets**: Update app icons, splash screens, and notification icons
6. **Permissions**: Review and update permission declarations in manifests
7. **App Store Metadata**: Configure store descriptions and screenshots

## Feature Highlights

### Enhanced Gallery
The gallery feature provides enterprise-level media management:

- **Multi-Selection**: Select multiple images with visual feedback
- **Bulk Operations**: Download or export selected images in batches
- **PDF Export**: Generate professional PDF documents from selected images
- **Progress Tracking**: Real-time download and export progress indicators
- **Permissions Management**: Automatic handling of storage and camera permissions
- **File Organization**: Organized file structure with proper naming conventions

### Smart Notifications
Comprehensive notification system with rich features:

- **Multi-Channel Support**: Separate channels for different notification types
- **Interactive Notifications**: Custom actions directly from notifications
- **Scheduled Notifications**: Local notifications with precise timing
- **Push Integration**: Firebase Cloud Messaging for remote notifications
- **Debug Interface**: Development tools for testing notification scenarios

### Internationalization
Complete multi-language support:

- **Dynamic Switching**: Change language without app restart
- **Date Localization**: Properly formatted dates for each locale
- **Device Detection**: Automatic language detection from device settings
- **Fallback Support**: Graceful handling of missing translations

### Form System
Advanced form management with validation:

- **Real-time Validation**: Immediate feedback on form input
- **Custom Validators**: Extensible validation rule system
- **Error Management**: Field-level and form-level error handling
- **Accessibility**: Full accessibility support for form controls

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
   - Verify service class types and interfaces

5. **Navigation Issues**:
   - Verify navigation types in `navigation/types.ts`
   - Check navigation parameter passing
   - Ensure proper screen registration

### Feature-Specific Issues

#### Gallery & File Management
1. **Permission Denied Errors**:
   - Verify Android manifest permissions
   - Check iOS Info.plist usage descriptions
   - Test permission request flow on device

2. **File Download Issues**:
   - Check network connectivity
   - Verify API authentication headers
   - Monitor storage space availability

3. **PDF Generation Problems**:
   - Ensure HTML content is properly formatted
   - Check base64 image encoding
   - Verify file system write permissions

#### Notifications
1. **Push Notifications Not Working**:
   - Verify Firebase configuration
   - Check device token registration
   - Test notification permissions

2. **Local Notifications Issues**:
   - Verify notification channel creation
   - Check scheduling permissions
   - Test on physical device (not simulator)

3. **Notification Actions Not Responding**:
   - Verify action handlers are registered
   - Check navigation reference setup
   - Test background app state handling

#### Internationalization
1. **Language Not Switching**:
   - Check i18n initialization
   - Verify translation files exist
   - Test locale storage persistence

2. **Date Formatting Issues**:
   - Verify date-fns locale imports
   - Check locale setting in date utilities
   - Test different date format scenarios

### Performance Optimization

- **Component Optimization**: Use `React.memo` for expensive components
- **List Performance**: Implement `FlatList` with proper `keyExtractor` and `getItemLayout`
- **Image Optimization**: Compress and resize images appropriately
- **Memory Management**: Monitor service instances and event listeners
- **Bundle Analysis**: Use bundle analyzer to identify large dependencies
- **API Optimization**: Implement proper caching strategies

### Debugging

#### Development Tools
- **React Native Debugger**: Enhanced debugging experience with Redux DevTools
- **Flipper**: Advanced debugging and profiling with network inspection
- **Console Logs**: Strategic logging for development debugging
- **React DevTools**: Component tree inspection and props monitoring

#### Service Debugging
- **Notification Debug Screen**: Use `NotificationDebugScreen` for testing
- **Service Logs**: Enable detailed logging in service classes
- **API Monitoring**: Use network debugging tools for API calls
- **File System Debugging**: Monitor file operations and storage usage

#### Common Debug Commands
```bash
# Clear all caches
npm start -- --reset-cache

# Debug Android
npx react-native log-android

# Debug iOS
npx react-native log-ios

# Check bundle size
npx react-native bundle --platform android --dev false --entry-file index.js --bundle-output android-bundle.js --analyze
```

## Additional Resources

### Core Technologies
- [React Native Documentation](https://reactnative.dev/docs/getting-started)
- [React Navigation Documentation](https://reactnavigation.org/docs/getting-started)
- [React Native Paper](https://reactnativepaper.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

### Enhanced Features
- [React Native Firebase](https://rnfirebase.io/) - Push notifications and analytics
- [Notifee Documentation](https://notifee.app/react-native/docs/overview) - Local notifications
- [React Native FS](https://github.com/itinance/react-native-fs) - File system operations
- [React Native HTML to PDF](https://github.com/christopherdro/react-native-html-to-pdf) - PDF generation
- [React Native Permissions](https://github.com/zoontek/react-native-permissions) - Runtime permissions

### Internationalization
- [React i18next](https://react.i18next.com/) - Internationalization framework
- [Date-fns](https://date-fns.org/) - Date manipulation with locale support
- [React Native Localize](https://github.com/zoontek/react-native-localize) - Device locale detection

### UI & UX
- [Material Design 3](https://m3.material.io/) - Design system guidelines
- [React Native Vector Icons](https://github.com/oblador/react-native-vector-icons) - Icon library
- [React Native Linear Gradient](https://github.com/react-native-linear-gradient/react-native-linear-gradient) - Gradient components

### Development Tools
- [React Native Debugger](https://github.com/jhen0409/react-native-debugger)
- [Flipper](https://fbflipper.com/) - Advanced debugging platform
- [ESLint React Native](https://github.com/Intellicode/eslint-config-react-native)

### Best Practices
- [React Native Best Practices](https://github.com/react-native-community/discussions-and-proposals)
- [TypeScript React Native Guidelines](https://reactnative.dev/docs/typescript)
- [React Hooks Best Practices](https://reactjs.org/docs/hooks-rules.html)

---

## Support

For questions, bug reports, or feature requests:

1. **Issues**: Create an issue in the project repository with detailed information
2. **Documentation**: Check this README and inline code documentation
3. **Development Team**: Contact the development team for technical support
4. **Community**: Engage with the React Native community for general questions

### Reporting Issues

When reporting issues, please include:
- Device and OS version
- React Native version
- Steps to reproduce
- Expected vs actual behavior
- Relevant code snippets or screenshots
- Console logs or error messages

### Contributing

We welcome contributions! Please read the contributing guidelines and follow the development workflow outlined in this documentation.