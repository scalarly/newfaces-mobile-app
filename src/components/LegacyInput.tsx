/**
 * LegacyInput - Input component that matches legacy app styling
 */

import React from 'react';
import {
  View,
  Text,
  TextInput,
  TextInputProps,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

export interface LegacyInputProps extends Omit<TextInputProps, 'style'> {
  /** Input field title/label */
  title: string;
  /** Input value */
  value: string;
  /** Change handler */
  onChangeText: (text: string) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Error message */
  error?: string;
  /** Success message */
  success?: string;
  /** Custom input style */
  style?: any;
  /** Show password toggle for password fields */
  showPasswordToggle?: boolean;
  /** Current password visibility state */
  secureTextEntry?: boolean;
  /** Password toggle handler */
  onTogglePassword?: () => void;
}

export const LegacyInput: React.FC<LegacyInputProps> = ({
  title,
  value,
  onChangeText,
  placeholder,
  error,
  success,
  style,
  showPasswordToggle = false,
  secureTextEntry = false,
  onTogglePassword,
  ...textInputProps
}) => {
  return (
    <View style={styles.formInput}>
      <Text style={styles.inputTitle}>{title}</Text>
      <View style={styles.inputWrapper}>
        <TextInput
          style={[styles.textInput, style]}
          placeholderTextColor="#bbb"
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          secureTextEntry={secureTextEntry}
          {...textInputProps}
        />
        {showPasswordToggle && (
          <TouchableOpacity
            style={styles.togglePasswordButton}
            onPress={onTogglePassword}
            activeOpacity={0.7}
          >
            <Icon
              name={secureTextEntry ? 'eye-off' : 'eye'}
              size={20}
              color="#666"
            />
          </TouchableOpacity>
        )}
      </View>
      {(success || error) && (
        <View>
          {success && (
            <Text style={[styles.message, styles.successMessage]}>
              {success}
            </Text>
          )}
          {error && (
            <Text style={[styles.message, styles.errorMessage]}>
              {error}
            </Text>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  formInput: {
    marginTop: 32,
    lineHeight: 16,
  },
  inputTitle: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
    fontWeight: '500',
  },
  inputWrapper: {
    position: 'relative',
  },
  textInput: {
    width: 'auto',
    color: '#111111',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    paddingLeft: 15,
    paddingRight: 15,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  togglePasswordButton: {
    position: 'absolute',
    top: 12,
    right: 15,
    padding: 8,
  },
  message: {
    marginTop: 8,
    fontSize: 12,
  },
  successMessage: {
    color: '#28a745',
  },
  errorMessage: {
    color: '#dc3545',
  },
});
