import React from 'react';

export interface StockData {
  date: string;
  price: number;
  open: number;
  high: number;
  low: number;
  volume: number;
  ma5?: number;
  ma20?: number;
  rsi?: number;
}

export interface Scenario {
  id: string;
  name: string;
  enName: string;
  description: string;
  enDescription: string;
  icon: React.ReactNode;
  color: string;
  createdAt: string;
  popularity: number;
}

export interface Stock {
  id: string;
  name: string;
  code: string;
  type: 'domestic' | 'overseas';
}

export interface Quiz {
  id: number;
  question: string;
  enQuestion: string;
  options: string[];
  enOptions: string[];
  correctAnswer: number;
  explanation: string;
  enExplanation: string;
}

export interface UserRequest {
  id: string;
  date: string;
  title: string;
  content: string;
  status: 'pending' | 'completed';
}

export interface Transaction {
  id: string;
  date: string;
  type: 'cash' | 'dividend';
  fromAmount: number;
  fromCurrency: string;
  toAmount: number;
  toCurrency: string;
  action: 'EXCHANGE' | 'DEPOSIT';
  memo?: string;
}
