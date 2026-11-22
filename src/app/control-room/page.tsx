'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { db } from '@/lib/db';

const DynamicAgentControlRoom = dynamic(
  () => import('@/components/agent-room/AgentControlRoom'),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full bg-[#070b0e] flex items-center justify-center font-mono text-xs text-[#00f2a5]">
        Initializing React Flow Agent Canvas...
      </div>
    ),
  }
);

export default function ControlRoomPage() {
  const [nodes, setNodes] = React.useState<any[]>([]);

  React.useEffect(() => {
    fetch('/api/agents/nodes')
      .then((r) => r.json())
      .then((d) => d.nodes && setNodes(d.nodes));
  }, []);

  return (
    <div className="h-[calc(100vh-6.5rem)] w-full">
      <DynamicAgentControlRoom initialNodesData={nodes} />
    </div>
  );
}
