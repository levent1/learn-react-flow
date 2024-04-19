import { useCallback, useState, useEffect, useRef } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  NodeToolbar,
  addEdge,
} from 'reactflow';
import axios from 'axios';

import 'reactflow/dist/style.css';
import './css/Flow.css';


const initialNodes = [
  { id: '1', position: { x: 0, y: 0 }, data: { label: 'Başlangıç' } },
  { id: '2', position: { x: 0, y: 100 }, data: { label: 'Bitiş' } },
];

const initialEdges = [{ id: 'e1-2', source: '1', target: '2', animated: true }];

export default function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [idCreate, setidCreate] = useState(3);
  const [selectedNode, setSelectedNode] = useState(null);
  const [selectedEdge, setSelectedEdge] = useState(null);
  const [selectedOptionGeneral, setSelectedOptionGeneral] = useState('İzin Talebi');
  const [selectedOption, setSelectedOption] = useState('İzin talebi');
  const [nodeName, setNodeName] = useState('');
  const [infoBlockVisible, setInfoBlockVisible] = useState(false);
  const [infoEdgeBlockVisible, setInfoEdgeBlockVisible] = useState(false);
  const [taskDescription, setTaskDescription] = useState('');
  const infoBlockRef = useRef(null);
  const infoBlockEdgeRef = useRef(null);
  const [nodeIfStatement, setNodeIfStatement] = useState('');


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

  const addNode = useCallback(() => {
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
    setInfoBlockVisible(true);
    console.log('Tıklanan Düğüm:', node);
  };

  const handleEdgeClick = (event, edge) => {
    setSelectedEdge(edge);
    setInfoEdgeBlockVisible(true);
    console.log('Tıklanan Bağlantı:', edge);
  };

  const handeleNodeDoubleClick = (event, node) => {
    console.log('Çift Tıklanan Düğüm:', node);
    setSelectedNode(node);
    setInfoBlockVisible(true);
    setNodeName(node.data.label);
  };
  const handleEdgeIfStatementDoubleClick = (event, edge) => {
    console.log('Çift Tıklanan Bağlantı:', edge);
    setSelectedEdge(edge);
    setInfoEdgeBlockVisible(true);
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
  const handeleChangeDropdownGeneral = (event) => {
    setSelectedOptionGeneral(event.target.value);
  };
  const handleTaskDescriptionChange = (event) => {
    const newDescription = event.target.value;
    setTaskDescription(newDescription);
    updateNodeInfo(nodeName, selectedOption, newDescription); // Node ismi, seçilen opsiyon ve görev açıklamasını güncelle
  };

  const handleSelectedOptionChange = (event) => {
    const newOption = event.target.value;
    setSelectedOption(newOption);
    updateNodeInfo(nodeName, newOption, taskDescription); // Node ismi, seçilen opsiyon ve görev açıklamasını güncelle
  };

  const handleNodeNameChange = (event) => {
    const newName = event.target.value;
    setNodeName(newName);
    updateNodeInfo(newName, selectedOption, taskDescription); // Node ismi, seçilen opsiyon ve görev açıklamasını güncelle
  };

  const handleNodeIfStatementChange = (event) => {
    const nodeIfStatement = event.target.value;
    setNodeIfStatement(nodeIfStatement);
    updateNodeIfStatementInfo(nodeIfStatement); // Node ismi, seçilen opsiyon ve görev açıklamasını güncelle
  };

  const handleOutsideClick = (event) => {
    if (infoBlockRef.current && !infoBlockRef.current.contains(event.target)) {
      if (infoBlockVisible) {
        updateNodeInfo(nodeName, selectedOption, taskDescription); // Node ismini güncelle
        setInfoBlockVisible(false);
      }
    }
    if (infoBlockEdgeRef.current && !infoBlockEdgeRef.current.contains(event.target)) {
      if (infoEdgeBlockVisible) {
        updateNodeIfStatementInfo(nodeIfStatement);
        setInfoEdgeBlockVisible(false);
      }
    }
  };

  const updateNodeInfo = (newName, newOption, newDescription) => {
    if (selectedNode) { // selectedNode null değilse devam et
      const updatedNodes = nodes.map(n => {
        if (n.id === selectedNode.id) {
          return {
            ...n,
            data: {
              ...n.data,
              label: newName,
              unit: newOption, // selectedOption değerini güncelle
              toDo: newDescription // taskDescription değerini güncelle
            }
          };
        }
        return n;
      });
      setNodes(updatedNodes);
    }
  };

  const updateNodeIfStatementInfo = (nodeIfStatement) => {
    if (selectedEdge) { // selectedNode null değilse devam et
      const updatedEdges = edges.map(edge => {
        if (edge.id === selectedEdge.id) {
          return {
            ...edge,
            data: {
              ...edge.data,
              state: nodeIfStatement
            }
          };
        }
        return edge;
      });
      setEdges(updatedEdges);
    }
  };
  const handleSave = async () => {
    try {
      const response = await axios.post('http://localhost:3000/flow', { selectedOptionGeneral, nodes, edges });
      console.log('Veriler başarıyla kaydedildi:', response.data);
    } catch (error) {
      console.error('Verileri kaydetme hatası:', error);
    }
  };
  return (
    <div style={{ width: '100vw', height: '100vh' }} onClick={handleOutsideClick}>
      <div className='tools'>
        <button className='btn' onClick={addNode}>Node Ekle</button>
        <button className='btn' onClick={deleteNode}>Sil</button>
        <button className='btn' onClick={handleSave}>Kaydet</button>
        <select className='dropdown' value={selectedOptionGeneral} onChange={handeleChangeDropdownGeneral}>
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
        onNodeDoubleClick={(event, node) => handeleNodeDoubleClick(event, node)}
        onEdgeDoubleClick={(event, edge) => handleEdgeIfStatementDoubleClick(event, edge)}
      >
        <div className='info' style={{ position: 'absolute', display: infoBlockVisible ? 'block' : 'none' }}>
          {nodes.map(node => (
            <div key={node.id} style={{}}>
              {node.id === selectedNode?.id && (
                <div className='infoblock'>
                  <label >İsim: </label>
                  <input
                    type="text"
                    value={nodeName}
                    onChange={handleNodeNameChange}
                    placeholder='Noda isim ver'
                  />
                  <label >İlgili Birim: </label>
                  <select
                    className='active_unit'
                    value={selectedOption}
                    onChange={handleSelectedOptionChange}
                  >
                    <option value='Yazılım Gelişimi'>Yazılım Geliştirme</option>
                    <option value='Muhasebe'>Muhasebe</option>
                    <option value='İnsan Kaynakları'>İnsan kaynakları</option>
                  </select>
                  <label >İlgili Not(Var ise): </label>
                  <textarea
                    name="text-area"
                    placeholder='Yapılacak işlem Açıklaması ekle'
                    value={taskDescription}
                    onChange={handleTaskDescriptionChange}
                  ></textarea>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className='info-edge' style={{ position: 'absolute', display: infoEdgeBlockVisible ? 'block' : 'none' }}>
          {edges.map(edge => {
            const selectedNode = nodes.find(node => node.id === edge.source);
            if (!selectedNode) return null; // Eğer kaynak düğüm bulunamazsa, işlemi durdur
            return (
              <div key={edge.id} >
                {edge.id === selectedEdge?.id && (
                  <div className='infoblock-edge' ref={infoBlockEdgeRef}>
                    <label >Koşulu Belirleyiniz: </label>
                    <input
                      type="text"
                      value={nodeIfStatement}
                      onChange={handleNodeIfStatementChange}
                      placeholder='Koşulu Belirle'
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <Controls />
        <MiniMap />
        <Background variant="dots" gap={12} size={1} />
        <NodeToolbar />
      </ReactFlow>

    </div>
  );


}