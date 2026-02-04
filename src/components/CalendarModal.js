import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity } from 'react-native';
import { Calendar } from 'react-native-calendars';
import styled from 'styled-components/native';
import { useWorkout } from '../context/WorkoutContext';
import { X } from 'lucide-react-native';

const ModalContainer = styled.View`
  flex: 1;
  background-color: rgba(0,0,0,0.5);
  justify-content: center;
  align-items: center;
`;

const Content = styled.View`
  width: 90%;
  background-color: white;
  border-radius: 14px;
  padding: 16px;
  max-height: 80%;
`;

const HeaderRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const Title = styled.Text`
  font-size: 18px;
  font-weight: bold;
`;

export default function CalendarModal({ visible, onClose, onSelectDate }) {
  const { markedDates } = useWorkout();

  const handleDayPress = (day) => {
    if (onSelectDate) {
      onSelectDate(day.dateString);
    }
  };

  // markedDates from context is multi-dot. We need to convert or simplify if we want iOS style selection.
  // But context returns `{ 'date': { dots: [...] } }`.
  // User asked to remove blue dots.
  // "Elimina i pallini blu."
  // "Usa lo stile iOS originale. Il giorno selezionato deve avere un cerchio pieno..."
  // I should strip out the 'today' blue dot from the context data, or just ignore dots if I want clean?
  // But "Red dot: Indica le giornate in cui è presente almeno un log salvato."
  // So I should keep Red, remove Blue.
  // And use `markingType` to `multi-dot` or `dot`.
  // If I use `markingType={'dot'}`, I can pass `dots: [Array]`? No, standard `dot` supports `marked: true, dotColor`.
  // `multi-dot` supports `dots: []`.
  // If I want to support Red dots, I should filter the `markedDates` from context.

  const processedMarkedDates = {};
  Object.keys(markedDates).forEach(date => {
      const data = markedDates[date];
      if (data.dots) {
          // Filter out blue dots (key 'today')
          const filteredDots = data.dots.filter(d => d.key !== 'today');
          if (filteredDots.length > 0) {
              processedMarkedDates[date] = { dots: filteredDots };
          }
      }
  });

  return (
    <Modal visible={visible} transparent animationType="slide">
      <ModalContainer>
        <Content>
          <HeaderRow>
            <Title>Calendar</Title>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color="#000" />
            </TouchableOpacity>
          </HeaderRow>

          <Calendar
            markingType={'multi-dot'}
            markedDates={processedMarkedDates}
            onDayPress={handleDayPress}
            theme={{
              arrowColor: '#007AFF',
              todayTextColor: '#007AFF',
              selectedDayBackgroundColor: '#007AFF',
              selectedDayTextColor: '#ffffff',
            }}
          />
        </Content>
      </ModalContainer>
    </Modal>
  );
}
