import React from 'react';
import styled from 'styled-components/native';
import { X } from 'lucide-react-native';

const Container = styled.View`
  padding: 8px 16px;
  margin-bottom: 8px;
  position: relative;
  min-height: 40px;
  background-color: ${props => props.theme.colors.background};
  width: 90%;
`;

const Input = styled.TextInput`
  font-size: 16px;
  color: ${props => props.theme.colors.text};
  font-family: ${props => props.theme.fonts.regular};
  padding-right: 24px;
`;

const DeleteButton = styled.TouchableOpacity`
  position: absolute;
  top: 8px;
  right: 16px;
  z-index: 10;
`;

export default function TextBlock({ content, onChange, onFocus, onDelete, placeholder }) {
  return (
    <Container>
      {onDelete && (
        <DeleteButton onPress={onDelete}>
          <X size={16} color="#8E8E93" />
        </DeleteButton>
      )}
      <Input
        multiline
        value={content}
        onChangeText={onChange}
        placeholder={placeholder || "Write a note..."}
        placeholderTextColor="#999"
        scrollEnabled={false}
        onFocus={onFocus}
      />
    </Container>
  );
}
