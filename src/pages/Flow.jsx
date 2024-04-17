import  { useCallback, useState ,useEffect} from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  NodeToolbar,
  addEdge,
} from 'reactflow';
 
import 'reactflow/dist/style.css';
import './css/Flow.css';


const initialNodes = [
  { id: '1', position: { x: 0, y: 0 }, data: { label: 'Kullanıcı Başlangıcı' } },
  { id: '2', position: { x: 0, y: 100 }, data: { label: '2' } },
];

const initialEdges = [{ id: 'e1-2', source: '1', target: '2' ,animated:true}];

export default function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [idCreate, setidCreate] = useState(3);
  const [selectedNode, setSelectedNode] = useState(null);
  const [selectedEdge, setSelectedEdge] = useState(null);
  const [selectedOption, setSelectedOption] = useState('İzin talebi');
  const [nodeName, setNodeName] = useState('');
  const [infoBlockVisible, setInfoBlockVisible] = useState(false);
  const [taskDescription, setTaskDescription] = useState('');
 
 const onConnect = useCallback(
  (connection) => {
    setEdges((oldEdges) => addEdge(connection, oldEdges));
  },
  [setEdges],
);

useEffect(() => {
  setEdges((oldEdges) => {
    const updatedEdges = oldEdges.map((edge) => ({
      ...edge,
      animated: true,
    }));
    return updatedEdges;
  });
}, [edges, setEdges]);

const addNode= useCallback(() => {
    setidCreate(idCreate => idCreate + 1);
    const newNode = {
        id: String(idCreate),
        position: { x: 0, y: 0 },
        data: { label: String(idCreate) }
    };
    setNodes(prevNodes => [...prevNodes, newNode]);
}, [idCreate, setNodes]);

const handleNodeClick = (event, node) => {
    setSelectedNode(node);
    console.log('Tıklanan Düğüm:', node);
};

const handleEdgeClick = (event, edge) => {
  setSelectedEdge(edge);
  console.log('Tıklanan Bağlantı:', edge);
};

const handeleNodeDoubleClick =(event,node)=>{
  console.log('Tıklanan Çift Tıklanan Düğüm:', node);
  setInfoBlockVisible(true);
};

const deleteNode = useCallback(() => {
  if (selectedNode) {
      const nodeId = selectedNode.id;
      const filteredNodes = nodes.filter(node => node.id !== nodeId);
      setNodes(filteredNodes);
      setSelectedNode(null);
      console.log('Node silindi');
  }

  if (selectedEdge) {
      const edgeId = selectedEdge.id;
      const filteredEdges = edges.filter(edge => edge.id !== edgeId);
      setEdges(filteredEdges);
      setSelectedEdge(null);
      console.log('Edge silindi');
  }

  if (!selectedNode && !selectedEdge) {
    console.log('Silinecek bir düğüm veya bağlantı seçilmedi');
  }
}, [nodes, edges, selectedNode, selectedEdge]);

const handeleChangeDropdown = (event) => {
  setSelectedOption(event.target.value);
};

const handleNodeNameChange = (event) => {
  setNodeName(event.target.value);
};

const handleSelectedOptionChange = (event) => {
  setSelectedOption(event.target.value);
};

const handleTaskDescriptionChange = (event) => {
  setTaskDescription(event.target.value);
};

const handleOutsideClick = () => {
  if (infoBlockVisible) {
    updateNodeInfo();
    setInfoBlockVisible(false);
  }
};

const updateNodeInfo = () => {
  const updatedNodes = nodes.map(n => {
    if (n.id === selectedNode.id) {
      return {
        ...n,
        data: {
          label: nodeName,
          unit: selectedOption,
          toDo: taskDescription
        }
      };
    }
    return n;
  });
  setNodes(updatedNodes);
};
  
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <div className='tools'>
        <button className='btn' onClick={addNode}>Node Ekle</button>
        <button className='btn' onClick={deleteNode}>Sil</button>
        <button className='btn'>Kaydet</button>
       <select className='dropdown' value={selectedOption} onChange={handeleChangeDropdown}>
        <option value="İzin Talebi">İzin Talebi</option>
        <option value="Eğitim Talebi"> Eğitim Talebi</option>
        <option value="Avans Talebi"> Avans Talebi</option>
        <option value="Harcama Talebi">Harcama Talebi</option>
       </select>

        
      </div>
      
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        elements={[]} 
        onNodeClick={(event, node) => handleNodeClick(event, node)}
        onEdgeClick={(event, edge) => handleEdgeClick(event, edge)}
        onNodeDoubleClick={(event,node)=>handeleNodeDoubleClick(event,node)}
        >
          <input></input>
        <div style={{ width: '100vw', height: '100vh' }} onClick={handleOutsideClick}>
      {infoBlockVisible && (
        <div className='infoblock'>
          <input
            type="text"
            value={nodeName}
            placeholder='Noda isim ver'
            onChange={handleNodeNameChange}
          />
          <select
            className='active_unit'
            value={selectedOption}
            onChange={handleSelectedOptionChange}
          >
            <option value='Yazılım Gelişimi'>Yazılım Geliştirme</option>
            <option value='Muhasebe'>Muhasebe</option>
            <option value='İnsan Kaynakları'>İnsan kaynakları</option>
          </select>
          <textarea
            name="text-area"
            placeholder='Yapılacak işlem Açıklaması ekle'
            value={taskDescription}
            onChange={handleTaskDescriptionChange}
          ></textarea>
         </div>  
         )}

       </div>
        <Controls />
        <MiniMap />
        <Background variant="dots" gap={12} size={1} />
        <NodeToolbar />
      </ReactFlow>
    </div>
  );
}