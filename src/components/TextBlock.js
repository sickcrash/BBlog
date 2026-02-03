import React from 'react';
import styled from 'styled-components/native';

const Container = styled.View`
  padding: 8px 16px;
  margin-bottom: 8px;
`;

const Input = styled.TextInput`
  font-size: 16px;
  color: ${props => props.theme.colors.text};
  font-family: ${props => props.theme.fonts.regular};
`;

export default function TextBlock({ content, onChange, onFocus }) {
  return (
    <Container>
      <Input
        multiline
        value={content}
        onChangeText={onChange}
        placeholder="Write a note..."
        placeholderTextColor="#999"
        scrollEnabled={false}
        onFocus={onFocus}
      />
    </Container>
  );
}
