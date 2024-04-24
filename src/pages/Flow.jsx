import { useCallback, useState, useEffect, useRef } from 'react';
import ReactFlow, {
  ReactFlowProvider,
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



const initialNodes = []

const initialEdges = [];

export default function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  /*const [idCreate, setidCreate] = useState(3);*/
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
  const reactFlowWrapper = useRef(null);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);

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
        arrowHeadType: 'arrow',
        markerStart: 'myCustomSvgMarker', // markerStart özelliğini ekleyin
        markerEnd: { type: 'arrow', color: 'white' } // markerEnd özelliğini ekleyin
      }));
      return updatedEdges;
    });
  }, [edges, setEdges]);

  /*const addNode = useCallback(() => {
    setidCreate(idCreate => idCreate + 1);
    const newNode = {
      id: String(idCreate),
      position: { x: 0, y: 0 },
      data: { label: String(idCreate) }
    };
    setNodes(prevNodes => [...prevNodes, newNode]);
  }, [idCreate, setNodes]);
*/
  const handleNodeClick = (event, node) => {
    setSelectedNode(node);
    setInfoBlockVisible(true);
    setNodeName(node.data.label);
    setSelectedOption(node.data.unit);
    setTaskDescription(node.data.toDo || '');
    console.log('Tıklanan Düğüm:', node);
  };

  const handeleNodeDoubleClick = (event, node) => {
    setSelectedNode(node);
    setInfoBlockVisible(true);
    setNodeName(node.data.label);
    setSelectedOption(node.data.unit);
    setTaskDescription(node.data.toDo || '');
    console.log('Tıklanan Düğüm:', node);

  };

  // Tıklanan kenarı işaretle
  const handleEdgeClick = (event, edge) => {
    if (selectedEdge && selectedEdge.id === edge.id) {
      // Zaten seçili edge'e tıklandıysa, seçimi iptal et
      setSelectedEdge(null);
      setInfoEdgeBlockVisible(false);
    } else {
      // Başka bir edge'e tıklandıysa, yeni edge'i seç ve diğer seçimleri temizle
      setSelectedEdge(edge);
      setInfoEdgeBlockVisible(true);
      setNodeIfStatement(edge.data?.state || '');
      setSelectedNode(null); // Seçili düğümü temizle
      setInfoBlockVisible(false); // Düğüm bilgi bloğunu gizle
      console.log('Tıklanan Bağlantı:', edge);
    }

    // Seçilen kenara "selected" sınıfını ekle
    event.target.classList.add('selected');
  };

  const handleEdgeIfStatementDoubleClick = (event, edge) => {
    if (selectedEdge && selectedEdge.id === edge.id) {
      // Zaten seçili edge'e çift tıklandıysa, seçimi iptal et
      setSelectedEdge(null);
      setInfoEdgeBlockVisible(false);
    } else {
      // Başka bir edge'e çift tıklandıysa, yeni edge'i seç ve diğer seçimleri temizle
      setSelectedEdge(edge);
      setInfoEdgeBlockVisible(true);
      setNodeIfStatement(edge.data?.state || '');
      setSelectedNode(null); // Seçili düğümü temizle
      setInfoBlockVisible(false); // Düğüm bilgi bloğunu gizle
      console.log('Çift Tıklanan Bağlantı:', edge);
    }
  };
  const deleteNode = useCallback(() => {
    if (selectedNode) {
      const nodeId = selectedNode.id;
      const filteredNodes = nodes.filter(node => node.id !== nodeId);
      setNodes(filteredNodes);
      onNodesChange(filteredNodes); // Düğümleri güncelle
      setSelectedNode(null);
      setInfoBlockVisible(false);
      console.log('Node silindi');
    }

    if (selectedEdge) {
      const edgeId = selectedEdge.id;
      const filteredEdges = edges.filter(edge => edge.id !== edgeId);
      setEdges(filteredEdges);
      onEdgesChange(filteredEdges); // Kenarları güncelle
      setSelectedEdge(null);
      setInfoEdgeBlockVisible(false);
      console.log('Edge silindi');
    }

    if (!selectedNode && !selectedEdge) {
      console.log('Silinecek bir düğüm veya bağlantı seçilmedi');
    }
  }, [nodes, edges, selectedNode, selectedEdge, onNodesChange, onEdgesChange, setNodes, setEdges, setSelectedNode, setSelectedEdge, setInfoBlockVisible, setInfoEdgeBlockVisible]);

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
    console.log("handleOutsideClick çalıştı");

    // infoBlockRef ve infoBlockEdgeRef içerisinde herhangi bir yerde tıklanıp tıklanmadığını kontrol et
    if (
      (infoBlockRef.current && !infoBlockRef.current.contains(event.target) && infoBlockVisible) ||
      (infoBlockEdgeRef.current && !infoBlockEdgeRef.current.contains(event.target) && infoEdgeBlockVisible)
    ) {
      console.log("info block dışında bir yere tıklandı");
      // infoBlockVisible ve infoEdgeBlockVisible durumlarını güncelle
      if (infoBlockVisible) {

        updateNodeInfo(nodeName, selectedOption, taskDescription);
        setInfoBlockVisible(false);

      }
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

  // Sürükle Bırak ile yeni node oluşturma
  let id = 0;
  const getId = () => `dndnode_${id++}`;
  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      const nodeClass = event.dataTransfer.getData('application/nodeclass'); // Sürüklenen öğenin sınıfını al
      const nodelabel = event.dataTransfer.getData('application/nodelabel');
      // check if the dropped element is valid
      if (typeof type === 'undefined' || !type) {
        return;
      }

      // reactFlowInstance.project was renamed to reactFlowInstance.screenToFlowPosition
      // and you don't need to subtract the reactFlowBounds.left/top anymore
      // details: https://reactflow.dev/whats-new/2023-11-10
      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      let backgroundColor = 'white';
      let borderRadius = '0%'
      let width;
      let height;
      let paddingTop;


      // Check node class and set background color accordingly
      switch (nodeClass) {
        case 'dndnode input':
          backgroundColor = '#FBBB89';
          break;
        case 'dndnode':
          backgroundColor = '#D3B1EE';
          break;
        case 'dndnode output-reject':
          backgroundColor = '#FF9D92';
          borderRadius = '50%';
          width = '60px';
          height = '60px';
          paddingTop = "17px"
          break;
        case 'dndnode output-accept':
          backgroundColor = '#8DA13B';
          borderRadius = '50%';
          width = '60px';
          height = '60px';
          paddingTop = "17px"

          break;
        default:
          backgroundColor = '#D3B1EE';
          break;
      }

      const newNode = {
        id: getId(),
        type,
        position,
        data: { label: `${nodelabel} ` },
        style: { backgroundColor, borderRadius, width, height, paddingTop }
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance],
  );

  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };



  return (
    <div className="dndflow" style={{ width: '98  vw', height: '90vh', position: 'relative' }} >
      <ReactFlowProvider>
        <div className="reactflow-wrapper" ref={reactFlowWrapper}>
          <aside>
            <img src="src\pages\logo.png" alt="Bilge Adam Teknoloji Logo" className='logo' />
            <div
              className="dndnode input"
              onDragStart={(event) => {
                event.dataTransfer.setData('application/reactflow', 'input');
                event.dataTransfer.setData('application/nodeclass', 'dndnode input');
                event.dataTransfer.setData('application/nodelabel', 'Başlangıç');
                onDragStart(event, 'input');
              }}
              draggable
              data-nodeclass="input" // Bu satırı ekleyerek nodeClass verisini taşıyoruz
            >
              Başlangıç
            </div>
            <div
              className="dndnode"
              onDragStart={(event) => {
                event.dataTransfer.setData('application/reactflow', 'default');
                event.dataTransfer.setData('application/nodeclass', 'dndnode');
                event.dataTransfer.setData('application/nodelabel', 'İşlem');
                onDragStart(event, 'default');
              }}
              draggable
              data-nodeclass="default" // Bu satırı ekleyerek nodeClass verisini taşıyoruz
            >
              İşlem
            </div>
            <div
              className="dndnode output-reject"
              onDragStart={(event) => {
                event.dataTransfer.setData('application/reactflow', 'output');
                event.dataTransfer.setData('application/nodeclass', 'dndnode output-reject');
                event.dataTransfer.setData('application/nodelabel', 'Red');
                onDragStart(event, 'output');
              }}
              draggable
              data-nodeclass="output-reject" // Bu satırı ekleyerek nodeClass verisini taşıyoruz
            >
              Red
            </div>
            <div
              className="dndnode output-accept"
              onDragStart={(event) => {
                event.dataTransfer.setData('application/reactflow', 'output');
                event.dataTransfer.setData('application/nodeclass', 'dndnode output-accept');
                event.dataTransfer.setData('application/nodelabel', 'Onay');
                onDragStart(event, 'output');
              }}
              draggable
              data-nodeclass="output-accept" // Bu satırı ekleyerek nodeClass verisini taşıyoruz
            >
              Onay
            </div>

          </aside>
          <div className='tools'>
            {/* <button className='btn' onClick={addNode}>Node Ekle</button> */}
            <button className='btn' onClick={deleteNode}>Sil</button>
            <button className='btn' onClick={handleSave}>Kaydet</button>
            <select className='dropdown' value={selectedOptionGeneral} onChange={handeleChangeDropdownGeneral}>
              <option value="İzin Talebi">İzin Talebi</option>
              <option value="Eğitim Talebi"> Eğitim Talebi</option>
              <option value="Avans Talebi"> Avans Talebi</option>
              <option value="Harcama Talebi">Harcama Talebi</option>
            </select>
          </div>
        </div>
        <ReactFlow className='react-flow-css'
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
          onInit={setReactFlowInstance}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onClick={handleOutsideClick}
          fitView

        >
          <div className='info' style={{ position: 'absolute', display: infoBlockVisible ? 'block' : 'none' }}>
            {nodes.map(node => (
              <div key={node.id} style={{}}>
                {node.id === selectedNode?.id && (
                  <div className='infoblock' ref={infoBlockRef}>
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
                      <option value="">Seçiniz</option>
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
                        value={nodeIfStatement ? nodeIfStatement : ""}
                        onChange={handleNodeIfStatementChange}
                        placeholder='Koşulu Belirle'
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <div className="fixed-bottom-left">
            <Controls />
          </div>
          <div className="fixed-bottom-right">
            <MiniMap pannable zoomable />
          </div>
          <NodeToolbar />
          <Background variant="dots" gap={12} size={1} />
        </ReactFlow>
      </ReactFlowProvider>
    </div>
  );

}