import React from 'react'

export default function NodeSelector({ nodes = [], selectedNode, setSelectedNode }) {
  return (
    <div className="node-selector">
      <label>Node:</label>
      <select 
        value={selectedNode || ''} 
        onChange={e => setSelectedNode(e.target.value)}
      >
        <option value="">All Nodes</option>
        {nodes.map(n => (
          <option key={n} value={n}>Node {n}</option>
        ))}
      </select>
    </div>
  )
}
