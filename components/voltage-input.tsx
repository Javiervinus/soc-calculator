'use client';

import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Battery, Mic, MicOff } from 'lucide-react';
import { useBatteryStore } from '@/lib/store';
import { toast } from 'sonner';

export function VoltageInput() {
  const { currentVoltage, setVoltage } = useBatteryStore();
  const [inputValue, setInputValue] = useState(currentVoltage.toString());
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    setInputValue(currentVoltage.toString());
  }, [currentVoltage]);

  useEffect(() => {
    // Inicializar reconocimiento de voz si está disponible
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || 
                                (window as any).SpeechRecognition;
      
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = 'es-ES';
        
        recognitionRef.current.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          processVoiceInput(transcript);
          setIsListening(false);
        };
        
        recognitionRef.current.onerror = (event: any) => {
          console.error('Error de reconocimiento:', event.error);
          toast.error('Error al capturar audio. Intenta de nuevo.');
          setIsListening(false);
        };
        
        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      }
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const processVoiceInput = (transcript: string) => {
    // Procesar el texto para extraer números
    // Reemplazar palabras comunes en español
    let processed = transcript.toLowerCase()
      .replace(/coma/g, '.')
      .replace(/punto/g, '.')
      .replace(/y/g, '')
      .replace(/voltios?/g, '')
      .replace(/volts?/g, '')
      .replace(/v/g, '');
    
    // Extraer números con decimales
    const matches = processed.match(/\d+\.?\d*/g);
    
    if (matches && matches.length > 0) {
      let voltage = parseFloat(matches[0]);
      
      // Si el número es mayor a 100, probablemente dijo "12 punto 8" como "128"
      if (voltage > 100) {
        const voltageStr = voltage.toString();
        if (voltageStr.length === 3) {
          // Convertir 128 a 12.8
          voltage = parseFloat(voltageStr.slice(0, 2) + '.' + voltageStr.slice(2));
        } else if (voltageStr.length === 4) {
          // Convertir 1380 a 13.80
          voltage = parseFloat(voltageStr.slice(0, 2) + '.' + voltageStr.slice(2));
        }
      }
      
      if (!isNaN(voltage) && voltage >= 10 && voltage <= 15) {
        setVoltage(voltage);
        setInputValue(voltage.toFixed(2));
        toast.success(`Voltaje establecido: ${voltage.toFixed(2)} V`);
      } else {
        toast.error('Por favor, di un voltaje entre 10.0 y 15.0 V');
      }
    } else {
      toast.error('No se pudo entender el voltaje. Intenta de nuevo.');
    }
  };

  const handleInputChange = (value: string) => {
    setInputValue(value);
    const voltage = parseFloat(value);
    if (!isNaN(voltage) && voltage >= 10 && voltage <= 15) {
      setVoltage(voltage);
    }
  };

  const handleSliderChange = (value: number[]) => {
    const voltage = value[0];
    setVoltage(voltage);
    setInputValue(voltage.toFixed(2));
  };

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      toast.error('Reconocimiento de voz no disponible en este navegador');
      return;
    }
    
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
      toast.info('Di el voltaje (ej: "doce punto ocho voltios")');
    }
  };

  return (
    <div className="p-3 sm:p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Battery className="h-4 w-4 text-blue-600" />
          <h2 className="text-sm font-semibold dark:text-white">Voltaje de Entrada</h2>
        </div>
        <div className="text-2xl font-bold text-blue-600">
          {currentVoltage.toFixed(2)} V
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Input
            type="number"
            value={inputValue}
            onChange={(e) => handleInputChange(e.target.value)}
            step="0.01"
            min="10"
            max="15"
            className="w-24 h-8 text-sm font-mono"
          />
          <Button
            onClick={toggleVoiceInput}
            size="icon"
            variant={isListening ? "destructive" : "outline"}
            className="h-8 w-8"
            title={isListening ? "Detener grabación" : "Entrada por voz"}
          >
            {isListening ? (
              <MicOff className="h-4 w-4 animate-pulse" />
            ) : (
              <Mic className="h-4 w-4" />
            )}
          </Button>
          <div className="flex-1">
            <Slider
              value={[currentVoltage]}
              onValueChange={handleSliderChange}
              min={10}
              max={15}
              step={0.01}
              className="w-full"
            />
          </div>
        </div>
        
        <div className="flex justify-between text-[10px] text-muted-foreground px-1">
          <span>10.0 V</span>
          <span>12.8 V</span>
          <span>15.0 V</span>
        </div>
      </div>
    </div>
  );
}