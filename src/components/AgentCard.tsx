'use client';
import {useState} from 'react';
import { Flight } from '@/hooks/useFlights';

interface AgentCardProps {
    flight:Flight;
    onClose:()=>void;
}