
import React, { useState } from 'react';
import { FinanceItem } from '../types';

interface UseItemEditorProps {
  onUpdate: (id: string, name: string, amount: number) => void;
}

export const useItemEditor = ({ onUpdate }: UseItemEditorProps) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editAmount, setEditAmount] = useState<number>(0);

  const startEditing = (item: FinanceItem) => {
    setEditingId(item.id);
    setEditName(item.name);
    setEditAmount(item.amount);
  };

  const saveEdit = () => {
    if (editingId) {
      onUpdate(editingId, editName, editAmount);
      setEditingId(null);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const handleNameChange = (val: string) => setEditName(val);
  const handleAmountChange = (val: string) => setEditAmount(parseFloat(val) || 0);
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') saveEdit();
    if (e.key === 'Escape') cancelEdit();
  };

  return {
    editingId,
    editName,
    editAmount,
    startEditing,
    saveEdit,
    handleNameChange,
    handleAmountChange,
    handleKeyDown
  };
};
