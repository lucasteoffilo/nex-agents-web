'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Send, Share2, User } from 'lucide-react';
import { useParams } from 'next/navigation';

export default function AgentChatPage() {
  const params = useParams();
  const agentId = params.agentId as string;
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<{ text: string; sender: 'user' | 'agent' }[]>([]);

  // Dados simulados do agente
  const agentData = {
    name: 'Juninho das Vendas',
    role: 'Vendedor Interno da QRBand',
    avatar: '/agent-avatar.png' // Caminho para o avatar (pode ser substituído)
  };

  const handleSendMessage = () => {
    if (!message.trim()) return;
    
    // Adiciona a mensagem do usuário
    setMessages([...messages, { text: message, sender: 'user' }]);
    
    // Simula uma resposta do agente (em uma aplicação real, isso seria uma chamada API)
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        text: `Olá! Sou o ${agentData.name}, como posso ajudar?`, 
        sender: 'agent' 
      }]);
    }, 1000);
    
    setMessage('');
  };

  return (
    <div className="flex flex-col w-full h-[calc(100vh-100px)] border rounded-lg shadow-sm">
      {/* Cabeçalho do chat */}
      <div className="flex items-center justify-between p-3 border-b">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-full bg-brand-500 flex items-center justify-center text-white">
            <User className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-semibold text-base">{agentData.name}</h2>
            <p className="text-sm text-muted-foreground">{agentData.role}</p>
          </div>
        </div>
        <Button variant="outline" size="sm" className="text-sm h-10 px-4">
          <Share2 className="h-4 w-4 mr-2" />
          Compartilhar
        </Button>
      </div>

      {/* Área de mensagens */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ height: "calc(100vh - 130px)" }}>
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="h-20 w-20 rounded-full bg-brand-500 flex items-center justify-center text-white mb-5">
              <User className="h-10 w-10" />
            </div>
            <h3 className="text-xl font-semibold">{agentData.name}</h3>
            <p className="text-muted-foreground text-base max-w-md mt-3">
              {agentData.role}
            </p>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div 
              key={index} 
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <Card 
                className={`max-w-[80%] p-4 text-base ${
                  msg.sender === 'user' 
                    ? 'bg-brand-500 text-white border-brand-500' 
                    : 'bg-muted'
                }`}
              >
                {msg.text}
              </Card>
            </div>
          ))
        )}
      </div>

      {/* Área de input */}
      <div className="p-4 border-t">
        <div className="flex items-center space-x-3">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Escreva a mensagem"
            className="flex-1 h-12 text-base"
          />
          <Button 
            onClick={handleSendMessage} 
            size="icon" 
            className="h-12 w-12 rounded-full bg-brand-500 hover:bg-brand-600"
          >
            <Send className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </div>
  );
}