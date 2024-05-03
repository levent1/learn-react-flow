import React, { useCallback, useState, useEffect, useRef } from 'react';
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
import classNames from 'classnames';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Alert from '@mui/material/Alert';
import CheckIcon from '@mui/icons-material/Check';
import Select from '@mui/material/Select';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import Container from '@mui/material/Container';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import AdbIcon from '@mui/icons-material/Adb';
import axios from 'axios';
import 'reactflow/dist/style.css';
import './css/Flow.css';

const initialNodes = [];
const initialEdges = [];

export default function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState(null);
  const [selectedEdge, setSelectedEdge] = useState(null);
  const [selectedOptionGeneral, setSelectedOptionGeneral] = useState('İzin Talebi');
  const [selectedOption, setSelectedOption] = useState('');
  const [nodeName, setNodeName] = useState('');
  const [infoBlockVisible, setInfoBlockVisible] = useState(false);
  const [infoEdgeBlockVisible, setInfoEdgeBlockVisible] = useState(false);
  const [taskDescription, setTaskDescription] = useState('');
  const [nodeIfStatement, setNodeIfStatement] = useState('');
  const infoBlockRef = useRef(null);
  const infoBlockEdgeRef = useRef(null);
  const reactFlowWrapper = useRef(null);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const options = ["", "İzin Talebi", "Eğitim Talebi", "Avans Talebi", "Harcama Talebi"];
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
        animated: false,
        arrowHeadType: 'arrow',
        markerStart: 'myCustomSvgMarker', // markerStart özelliğini ekleyin
        markerEnd: { type: 'arrow', color: 'black' }, // markerEnd özelliğini ekleyin
      }));
      return updatedEdges;
    });
  }, [edges, setEdges]);

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

  const handleEdgeClick = (event, edge) => {
    if (selectedEdge && selectedEdge.id === edge.id) {
      setSelectedEdge(null);
      setInfoEdgeBlockVisible(false);
    } else {
      setSelectedEdge(edge);
      setInfoEdgeBlockVisible(true);
      setNodeIfStatement(edge.data?.state || '');
      setSelectedNode(null);
      setInfoBlockVisible(false);
      console.log('Tıklanan Bağlantı:', edge);
    }

    event.target.classList.add('selected');
  };

  const handleEdgeIfStatementDoubleClick = (event, edge) => {
    if (selectedEdge && selectedEdge.id === edge.id) {
      setSelectedEdge(null);
      setInfoEdgeBlockVisible(false);
    } else {
      setSelectedEdge(edge);
      setInfoEdgeBlockVisible(true);
      setNodeIfStatement(edge.data?.state || '');
      setSelectedNode(null);
      setInfoBlockVisible(false);
      console.log('Çift Tıklanan Bağlantı:', edge);
    }
  };

  const deleteNode = useCallback(() => {
    if (selectedNode) {
      const nodeId = selectedNode.id;
      const filteredNodes = nodes.filter((node) => node.id !== nodeId);
      setNodes(filteredNodes);
      onNodesChange(filteredNodes);
      setSelectedNode(null);
      setInfoBlockVisible(false);
      console.log('Node silindi');
    }

    if (selectedEdge) {
      const edgeId = selectedEdge.id;
      const filteredEdges = edges.filter((edge) => edge.id !== edgeId);
      setEdges(filteredEdges);
      onEdgesChange(filteredEdges);
      setSelectedEdge(null);
      setInfoEdgeBlockVisible(false);
      console.log('Edge silindi');
    }

    if (!selectedNode && !selectedEdge) {
      console.log('Silinecek bir düğüm veya bağlantı seçilmedi');
    }
  }, [
    nodes,
    edges,
    selectedNode,
    selectedEdge,
    onNodesChange,
    onEdgesChange,
    setNodes,
    setEdges,
    setSelectedNode,
    setSelectedEdge,
    setInfoBlockVisible,
    setInfoEdgeBlockVisible,
  ]);

  const handeleChangeDropdownGeneral = (event) => {
    setSelectedOptionGeneral(event.target.value);
  };

  const handleTaskDescriptionChange = (event) => {
    const newDescription = event.target.value;
    setTaskDescription(newDescription);
    updateNodeInfo(nodeName, selectedOption, newDescription);
  };

  const handleSelectedOptionChange = (event) => {
    const newOption = event.target.value;
    setSelectedOptionGeneral(newOption);
    updateNodeInfo(nodeName, newOption, taskDescription); // Node ismi, seçilen opsiyon ve görev açıklamasını güncelle
  };

  const handleNodeNameChange = (event) => {
    const newName = event.target.value;
    setNodeName(newName);
    updateNodeInfo(newName, selectedOption, taskDescription);
  };

  const handleNodeIfStatementChange = (event) => {
    const nodeIfStatement = event.target.value;
    setNodeIfStatement(nodeIfStatement);
    updateNodeIfStatementInfo(nodeIfStatement);
  };

  const handleOutsideClick = (event) => {
    if (
      (infoBlockRef.current && !infoBlockRef.current.contains(event.target) && infoBlockVisible) ||
      (infoBlockEdgeRef.current && !infoBlockEdgeRef.current.contains(event.target) && infoEdgeBlockVisible)
    ) {
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
    if (selectedNode) {
      const updatedNodes = nodes.map((n) => {
        if (n.id === selectedNode.id) {
          return {
            ...n,
            data: {
              ...n.data,
              label: newName,
              unit: newOption,
              toDo: newDescription,
            },
          };
        }
        return n;
      });
      setNodes(updatedNodes);
    }
  };

  const updateNodeIfStatementInfo = (nodeIfStatement) => {
    if (selectedEdge) {
      const updatedEdges = edges.map((edge) => {
        if (edge.id === selectedEdge.id) {
          return {
            ...edge,
            data: {
              ...edge.data,
              state: nodeIfStatement,
            },
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
      return (<Alert icon={<CheckIcon fontSize="inherit" />} severity="success">
        Veriler Başarı İle Kaydedildi.
      </Alert>)
    } catch (error) {
      <Alert icon={<CheckIcon fontSize="inherit" />} severity="error">
        Veriler Kaydedilemedi {error}
      </Alert>
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
      const nodeClass = event.dataTransfer.getData('application/nodeclass');
      const nodelabel = event.dataTransfer.getData('application/nodelabel');

      if (typeof type === 'undefined' || !type) {
        return;
      }

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      let backgroundColor = 'white';
      let borderRadius = '0%';
      let width;
      let height;
      let paddingTop;

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
          paddingTop = '17px';
          break;
        case 'dndnode output-accept':
          backgroundColor = '#8DA13B';
          borderRadius = '50%';
          width = '60px';
          height = '60px';
          paddingTop = '17px';
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
        style: {
          backgroundColor, borderRadius, width, height, paddingTop, className: classNames({
            'dndnode input': nodeClass === 'dndnode input',
            'dndnode': nodeClass === 'dndnode',
            'dndnode output-reject': nodeClass === 'dndnode output-reject',
            'dndnode output-accept': nodeClass === 'dndnode output-accept',
          })
        },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance],
  );

  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };


  const pages = ['Products', 'Pricing', 'Blog'];
  const settings = ['Profile', 'Account', 'Dashboard', 'Logout'];

  const [anchorElNav, setAnchorElNav] = React.useState(null);
  const [anchorElUser, setAnchorElUser] = React.useState(null);

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };
  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };




  return (
    <div className="dndflow" style={{ width: '98  vw', height: '80vh', position: 'relative' }}>

      <AppBar position="static" style={{ backgroundColor: 'white' }}>
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            <img src="src\pages\logo.png" alt="Bilge Adam Teknoloji Logo" className="logo" />
            <Typography
              variant="h5"
              noWrap
              component="a"
              href="#app-bar-with-responsive-menu"
              sx={{
                mr: 2,
                display: { xs: 'flex', md: 'none' },
                flexGrow: 1,
                fontFamily: 'monospace',
                fontWeight: 700,
                letterSpacing: '.3rem',
                color: 'black', // Renk buraya eklenmeli
                textDecoration: 'none',
              }}
            >
              LOGO
            </Typography>

            <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleOpenNavMenu}
                color="black"
              >
                <MenuIcon />
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorElNav}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'left',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'left',
                }}
                open={Boolean(anchorElNav)}
                onClose={handleCloseNavMenu}
                sx={{
                  display: { xs: 'block', md: 'none' },
                }}
              >
                {pages.map((page) => (
                  <MenuItem key={page} onClick={handleCloseNavMenu}>
                    <Typography textAlign="center" sx={{ color: 'black' }}>
                      {page}
                    </Typography>
                  </MenuItem>
                ))}
              </Menu>
            </Box>
            <AdbIcon sx={{ display: { xs: 'flex', md: 'none' }, mr: 1 }} />
            <Typography
              variant="h5"
              noWrap
              component="a"
              href="#app-bar-with-responsive-menu"
              sx={{
                mr: 2,
                display: { xs: 'flex', md: 'none' },
                flexGrow: 1,
                fontFamily: 'monospace',
                fontWeight: 700,
                letterSpacing: '.3rem',
                color: 'inherit',
                textDecoration: 'none',
              }}
            >
              LOGO
            </Typography>
            <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
              {pages.map((page) => (
                <Button
                  key={page}
                  onClick={handleCloseNavMenu}
                  sx={{ my: 2, color: 'white', display: 'block' }}
                >
                  {page}
                </Button>
              ))}
            </Box>

            <Box sx={{ flexGrow: 0 }}>
              <Tooltip title="Open settings">
                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                  <Avatar alt="Remy Sharp" src="/static/images/avatar/2.jpg" />
                </IconButton>
              </Tooltip>
              <Menu
                sx={{ mt: '45px' }}
                id="menu-appbar"
                anchorEl={anchorElUser}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorElUser)}
                onClose={handleCloseUserMenu}
              >
                {settings.map((setting) => (
                  <MenuItem key={setting} onClick={handleCloseUserMenu}>
                    <Typography textAlign="center">{setting}</Typography>
                  </MenuItem>
                ))}
              </Menu>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      <ReactFlowProvider>
        <div className="reactflow-wrapper" ref={reactFlowWrapper}>
          <aside>
            <div
              className="dndnode input"
              onDragStart={(event) => {
                event.dataTransfer.setData('application/reactflow', 'input');
                event.dataTransfer.setData('application/nodeclass', 'dndnode input');
                event.dataTransfer.setData('application/nodelabel', 'Başlangıç');
                onDragStart(event, 'input');
              }}
              draggable
              data-nodeclass="input"
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
              data-nodeclass="default"
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
              data-nodeclass="output-reject"
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
              data-nodeclass="output-accept"
            >
              Onay
            </div>
          </aside>
          <div className="tools">
            <Button variant="outlined" color="error" onClick={deleteNode} size='small'>
              Sil
            </Button>{' '}
            <Button variant="contained" color="success" onClick={handleSave} size='large'>
              Kaydet
            </Button>{' '}
            <select className="dropdown" value={selectedOptionGeneral} onChange={handeleChangeDropdownGeneral}>
              <option value="İzin Talebi">İzin Talebi</option>
              <option value="Eğitim Talebi"> Eğitim Talebi</option>
              <option value="Avans Talebi"> Avans Talebi</option>
              <option value="Harcama Talebi">Harcama Talebi</option>
            </select>
          </div>
        </div>
        <ReactFlow
          className="react-flow-css"
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
          <div className="info" style={{ position: 'absolute', display: infoBlockVisible ? 'block' : 'none' }}>
            {nodes.map((node) => (
              <div key={node.id} >
                {node.id === selectedNode?.id && (
                  <div className="infoblock" ref={infoBlockRef}>

                    <TextField
                      required
                      id="outlined-required"
                      label="Düğüm Adı"
                      defaultValue={node.data.label}
                      variant="outlined"
                      className="node-name"
                      onChange={handleNodeNameChange}
                    />
                    <InputLabel id="demo-simple-select-label">Birim</InputLabel>
                    <Select
                      labelId="demo-simple-select-label"
                      id="demo-simple-select"
                      value={selectedOption}
                      label="Birim"
                      onChange={handleSelectedOptionChange}
                      defaultValue='Seçiniz'
                      className="dropdown"
                    >
                      {options.map((option) => (
                        <MenuItem key={option} value={option}>{option}</MenuItem>
                      ))}
                    </Select>
                    <TextField
                      id="outlined-multiline-static"
                      label="Açıklama"
                      multiline
                      rows={4}
                      defaultValue={node.data.toDo || ''}
                      variant="outlined"
                      fullWidth
                      className="task-description"
                      onChange={handleTaskDescriptionChange}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="info" style={{ position: 'absolute', display: infoEdgeBlockVisible ? 'block' : 'none' }}>
            {edges.map((edge) => (
              <div key={edge.id} style={{}}>
                {edge.id === selectedEdge?.id && (
                  <div className="infoblock" ref={infoBlockEdgeRef}>
                    <TextField
                      required
                      id="outlined-required"
                      label="Eğer Durum"
                      defaultValue={edge.data?.state || ''}
                      variant="outlined"
                      className="node-if-statement"
                      onChange={handleNodeIfStatementChange}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="fixed-bottom-left">
            <Controls />
          </div>
          <div className="fixed-bottom-right">
            <MiniMap pannable zoomable nodeColor={(node) => {
              switch (node.style.className) {
                case 'dndnode input':
                  return '#FBBB89'; // Input renk
                case 'dndnode':
                  return '#D3B1EE'; // Default renk
                case 'dndnode output-reject':
                  return '#FF9D92'; // Red renk
                case 'dndnode output-accept':
                  return '#8DA13B'; // Onay renk
                default:
                  return '#D3B1EE'; // Varsayılan renk
              }
            }} />
          </div>
          <Background />
        </ReactFlow>
      </ReactFlowProvider >
    </div>
  );
}
