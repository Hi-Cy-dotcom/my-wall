interface LiveStatusProps {
  status: 'connected' | 'disconnected' | 'reconnecting';
}

export default function LiveStatus({ status }: LiveStatusProps) {
  const getStatusText = () => {
    switch (status) {
      case 'connected':
        return 'Live';
      case 'disconnected':
        return 'Offline';
      case 'reconnecting':
        return 'Reconnecting…';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'connected':
        return 'bg-green-500';
      case 'disconnected':
        return 'bg-red-500';
      case 'reconnecting':
        return 'bg-yellow-500';
    }
  };

  return (
    <div className="flex items-center gap-2 text-xs text-text-secondary" aria-live="polite">
      <div 
        className={`w-2 h-2 rounded-full ${getStatusColor()} ${
          status === 'reconnecting' ? 'animate-pulse' : ''
        }`}
        aria-hidden="true"
      />
      <span>{getStatusText()}</span>
    </div>
  );
}
