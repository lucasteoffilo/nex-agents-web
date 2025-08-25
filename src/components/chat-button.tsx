'use client';

import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ChatButtonProps {
  agentId: string;
}

export function ChatButton({ agentId }: ChatButtonProps) {
  const router = useRouter();
  
  const handleClick = () => {
    router.push(`/dashboard/chat/${agentId}`);
  };
  
  return (
    <Button 
      size="sm" 
      variant="default" 
      className="bg-brand-500 hover:bg-brand-600"
      onClick={handleClick}
    >
      <MessageSquare className="h-3 w-3 mr-1" />
      Conversar
    </Button>
  );
}

export function StaticChatButton() {
  return (
    <Button 
      size="sm" 
      variant="default" 
      className="bg-brand-500 hover:bg-brand-600"
    >
      <MessageSquare className="h-3 w-3 mr-1" />
      Conversar
    </Button>
  );
}