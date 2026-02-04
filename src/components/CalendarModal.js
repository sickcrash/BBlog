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

  const marked = { ...markedDates };

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
            markingType={'dot'}
            markedDates={marked}
            onDayPress={handleDayPress}
            theme={{
              arrowColor: '#007AFF',
              todayTextColor: '#007AFF',
              dotColor: '#007AFF',
              selectedDotColor: '#ffffff'
            }}
          />
        </Content>
      </ModalContainer>
    </Modal>
  );
}
