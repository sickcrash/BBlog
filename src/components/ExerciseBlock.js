import React from 'react';
import styled from 'styled-components/native';

const Container = styled.View`
  padding-left: 12px;
  margin: 8px 16px;
  border-left-width: 2px;
  border-left-color: ${props => props.theme.colors.primary};
`;

const TitleInput = styled.TextInput`
  font-size: 18px;
  font-weight: bold;
  color: ${props => props.theme.colors.text};
  margin-bottom: 4px;
`;

const ContentInput = styled.TextInput`
  font-size: 16px;
  color: ${props => props.theme.colors.text};
  line-height: 24px;
`;

export default function ExerciseBlock({ title, content, onTitleChange, onContentChange, onFocus }) {
  return (
    <Container>
      <TitleInput
        value={title}
        onChangeText={onTitleChange}
        placeholder="Exercise Name"
        placeholderTextColor="#999"
        onFocus={onFocus}
      />
      <ContentInput
        multiline
        value={content}
        onChangeText={onContentChange}
        placeholder="Sets x Reps @ Weight..."
        placeholderTextColor="#999"
        scrollEnabled={false}
        onFocus={onFocus}
      />
    </Container>
  );
}
