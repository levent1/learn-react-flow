import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Home from './pages/Home.jsx'; // Doğru dosya yolunu kullanın

import Flow from './pages/Flow.jsx';
import PersonelRequest from './pages/PersonelRequest.jsx';
import Shape from './pages/DnDFlow.jsx';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="flow" element={<Flow/>} />
        <Route path='requestpersonal' element={<PersonelRequest/>}/>
        <Route path='shape' element={<Shape/>}/>

      </Routes>
    </BrowserRouter>
  );
}

export default App;