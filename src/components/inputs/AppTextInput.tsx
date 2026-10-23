import React, {forwardRef} from 'react';
import {
  Platform,
  TextInput,
  TextInputProps,
} from 'react-native';

const webInputStyle = Platform.OS === 'web'
  ? ({
      outlineStyle: 'none',
      outlineWidth: 0,
      boxShadow: 'none',
    } as any)
  : undefined;

/**
 * Shared TextInput wrapper. All native TextInput props and caller styles pass
 * through unchanged; web-only defaults suppress the browser's blue outline.
 */
const AppTextInput = forwardRef<TextInput, TextInputProps>(
  ({style, ...props}, ref) => (
    <TextInput
      {...props}
      ref={ref}
      style={[style, webInputStyle]}
    />
  ),
);

AppTextInput.displayName = 'AppTextInput';

export default AppTextInput;
